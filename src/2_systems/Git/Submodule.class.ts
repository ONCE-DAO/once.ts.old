import { execSync, spawn, spawnSync } from "child_process";
import chokidar from "chokidar";
import {
  cpSync,
  existsSync,
  mkdirSync,
  renameSync,
  rmSync,
  symlinkSync,
  unlinkSync,
  watch,
  writeFileSync,
} from "fs";
import { join } from "path";
import { EAMD_FOLDERS } from "../../3_services/EAMD.interface";
import Submodule, {
  AddSubmoduleArgs,
} from "../../3_services/Submodule.interface";
import { NpmPackage } from "../NpmPackage.class";
import UcpComponentDescriptor from "../UcpComponentDescriptor.class";
import glob from "glob";
import DefaultGitRepository from "./GitRepository.class";

//TODO @PB Refactor code
export default class DefaultSubmodule implements Submodule {
  path: string | undefined;
  url: string | undefined;
  branch: string | undefined;
  devPath: string | undefined;
  private distFolder: string | undefined;

  // COmponents
  get distPath(){
const p = join(this.fullPath)
    return p
  }

  addFromRemoteUrl(args: AddSubmoduleArgs): Promise<Submodule> {
    throw new Error("Method not implemented.");
  }
  afterbuild(eamdPath: string): void {
    // this.updateTsMaps(eamdPath);
  }
  updateTsMaps(eamdPath: string) {
    glob(eamdPath + "/**/*.component.xml", {}, (err, files) => {
      console.log(files);
    });
  }

  async watch(eamdPath: string): Promise<void> {
    if (!this.devPath) throw "TODO RIGHT ERROR";
    console.log("START WATCH MODE", join(eamdPath, this.devPath, "package.json"));
    watch(join(eamdPath, this.devPath, "package.json"), undefined, () => {
      console.log("package.json changed -> install dependencies");
      this.installDependencies(eamdPath);
    });
    console.log(join(eamdPath, this.devPath, "src", "**", "*.ts"));
    chokidar
      .watch(join(eamdPath, this.devPath, "src"), { ignoreInitial: true })
      .on("add", (path, stats) => console.log("ADD", path))
      .on("change", (path) => {
        console.log("changed", path);
        this.build(eamdPath);
      });
  }
  installDependencies(eamdPath: string) {
    if (!this.devPath) throw new Error("Submodule does not exist");
    execSync(`npm install --prefix ${join(eamdPath, this.devPath)}`);
  }

  private npmBuild(path: string, version: string) {
    if (existsSync(join(path, version)))
      rmSync(join(path, version), { recursive: true });
    writeFileSync(
      join(path, "tsconfig.build.json"),
      JSON.stringify(
        {
          extends: "./tsconfig.json",
          compilerOptions: {
            rootDir: "./",
            outDir: version,
          },
          include: ["src/**/*.ts"],
        },
        null,
        2
      ),
      { encoding: "utf8", flag: "w+" }
    );

    execSync(`npm --prefix ${path} run build:version`);

    existsSync(join(path, "node_modules")) &&
      cpSync(join(path, "node_modules"), join(path, version, "node_modules"), {
        recursive: true,
      });
  }

  private copy(path: string, version: string, name: string, destname?: string) {
    existsSync(join(path, name)) &&
      cpSync(
        join(path, name),
        join(path, version, destname ? destname : name),
        { recursive: true }
      );
  }

  private get fullPath() {
    if (!global.ONCE) throw "ONCE not globally defined";
    return join(global.ONCE.eamd?.eamdDirectory || "", this.devPath || "");
  }
  private get npmPackage() {
    return NpmPackage.getByFolder(this.fullPath);
  }

  private get snapshot() {
    const branchString = this.branch ? `@${this.branch}` : "";
    return this.npmPackage?.name + branchString;
  }
  private get version() {
    return `${this.npmPackage?.version}-SNAPSHOT-${this.snapshot}`;
  }

  build(eamdPath: string) {
    if (!this.devPath) throw new Error("Submodule does not exist");
    const linkPackage = this.npmPackage?.linkPackage;
    try {
      this.npmBuild(this.fullPath, this.version);
      this.copy(
        this.fullPath,
        this.version,
        "package.build.json",
        "package.json"
      );
      this.copy(this.fullPath, this.version, "ressources");
      this.copy(this.fullPath, this.version, "bin");
      UcpComponentDescriptor.getInstance()
        .init({ path: this.fullPath, relativePath: this.devPath })
        .writeToPath(this.fullPath, this.version);

      const dist = join(
        this.fullPath,
        "..",
        "..",
        EAMD_FOLDERS.DIST,
        this.version
      );
      const current = join(dist, "..", EAMD_FOLDERS.CURRENT);

      try {
        unlinkSync(current);
      } catch {} //HACK REMOVE PB
      if (existsSync(dist)) {
        rmSync(dist, { recursive: true });
      }

      mkdirSync(dist, { recursive: true });
      renameSync(join(this.fullPath, this.version), dist);
      symlinkSync(dist, current);
      spawnSync("npm", ["--prefix", dist, "run", "build:version:after"], {
        encoding: "utf8",
      });
      if (linkPackage) {
        spawnSync("npm", ["r", this.npmPackage?.name || "", "-g"], {
          encoding: "utf8",
        });
        spawnSync("npm", ["link", dist], { encoding: "utf8" });
      }
      console.log("build");
    } finally {
      if (existsSync(join(this.fullPath, this.version)))
        rmSync(join(this.fullPath, this.version), { recursive: true });
    }
  }

  async init(config: {
    path?: string;
    url?: string;
    branch?: string;
  }): Promise<Submodule> {
    this.devPath = config.path;
    this.distFolder = join('..','..','dist')
    this.url = config.url;
    this.branch = config.branch;
    return this;
  }

  static getInstance() {
    const instance = new DefaultSubmodule();
    return instance;
  }

  static async getOrAddFromRemoteUrl({
    url,
    branch,
    once,
    overwrite,
  }: AddSubmoduleArgs): Promise<Submodule> {
    if (!once.eamd?.eamdRepository || !once.eamd.eamdDirectory)
      throw new Error("eamd repo not found");
    const tmpFolder = join(
      once.eamd.eamdDirectory,
      "tmp",
      Date.now().toString()
    );
    if (existsSync(tmpFolder)) rmSync(tmpFolder, { recursive: true });
    else mkdirSync(tmpFolder, { recursive: true });
    const repo = await DefaultGitRepository.getInstance().init({
      baseDir: tmpFolder,
      clone: { url, branch },
    });

    const pkg = NpmPackage.getByPath(join(tmpFolder, "package.build.json"));
    if (overwrite && pkg) {
      console.log("OVERWRITE with", overwrite);
      pkg.name = overwrite.name;
      pkg.namespace = overwrite.namespace;
      writeFileSync(
        join(tmpFolder, "package.build.json"),
        JSON.stringify(pkg, null, 2),
        { flag: "w+" }
      );
      writeFileSync(
        join(tmpFolder, "package.json"),
        JSON.stringify(pkg, null, 2),
        { flag: "w+" }
      );
    }

    const sub = await once.eamd.eamdRepository.addSubmodule(repo);
    await sub.installDependencies(once.eamd.eamdDirectory);
    await sub.build(once.eamd.eamdDirectory);
    once.ENV.NODE_ENV === "development" &&
      (await sub.watch(once.eamd.eamdDirectory));

    return sub;
  }
}
