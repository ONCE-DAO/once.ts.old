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
  url: string | undefined;
  branch: string | undefined;
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
  path: string | undefined;

  async watch(eamdPath: string): Promise<void> {
    if (!this.path) throw "TODO RIGHT ERROR";
    console.log("START WATCH MODE", join(eamdPath, this.path, "package.json"));
    watch(join(eamdPath, this.path, "package.json"), undefined, () => {
      console.log("package.json changed -> install dependencies");
      this.installDependencies(eamdPath);
    });
    console.log(join(eamdPath, this.path, "src", "**", "*.ts"));
    chokidar
      .watch(join(eamdPath, this.path, "src"), { ignoreInitial: true })
      .on("add", (path, stats) => console.log("ADD", path))
      .on("change", (path) => {
        console.log("changed", path);
        this.build(eamdPath);
      });
  }
  installDependencies(eamdPath: string) {
    if (!this.path) throw new Error("Submodule does not exist");
    execSync(`npm install --prefix ${join(eamdPath, this.path)}`);
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

  build(eamdPath: string) {
    if (!this.path) throw new Error("Submodule does not exist");
    const fullPath = join(eamdPath, this.path);

    const npmPackage = NpmPackage.getByFolder(fullPath);
    const snapshot = npmPackage?.name;
    const version = `${npmPackage?.version}-SNAPSHOT-${snapshot}`;
    const linkPackage = npmPackage?.linkPackage;
    try {
      this.npmBuild(fullPath, version);
      this.copy(fullPath, version, "package.build.json", "package.json");
      this.copy(fullPath, version, "ressources");
      this.copy(fullPath, version, "bin");
      UcpComponentDescriptor.getInstance()
        .init({ path: fullPath, relativePath: this.path })
        .writeToPath(fullPath, version);

      const dist = join(fullPath, "..", "..", EAMD_FOLDERS.DIST, version);
      const current = join(dist, "..", EAMD_FOLDERS.CURRENT);

      if (existsSync(dist)) {
        // TODO@PB mit versionsnummer kein problem
        rmSync(dist, { recursive: true });
        unlinkSync(current);
      }

      mkdirSync(dist, { recursive: true });
      renameSync(join(fullPath, version), dist);
      symlinkSync(dist, current);
      spawnSync("npm", ["--prefix", dist, "run", "build:version:after"], {
        encoding: "utf8",
      });
      if (linkPackage) {
        spawnSync("npm", ["r", npmPackage.name || "", "-g"], {
          encoding: "utf8",
        });
        spawnSync("npm", ["link", dist], { encoding: "utf8" });
      }
      console.log("build");
    } finally {
      if (existsSync(join(fullPath, version)))
        rmSync(join(fullPath, version), { recursive: true });
    }
  }

  async init(config: { path?: string, url?: string, branch?: string }): Promise<Submodule> {
    this.path = config.path;
    this.url = config.url;
    this.branch = config.branch;
    return this;
  }

  static getInstance() {
    const instance = new DefaultSubmodule();
    return instance;
  }

  static async addFromRemoteUrl({
    url,
    branch,
    once,
    overwrite,
  }: AddSubmoduleArgs): Promise<Submodule> {
    if (!once.eamd?.eamdRepository || !once.eamd.eamdDirectory)
      throw new Error("eamd repo not found");
    const tmpFolder = join(once.eamd.eamdDirectory, "tmp", url, branch || "");
    if (existsSync(tmpFolder)) rmSync(tmpFolder, { recursive: true });
    else mkdirSync(tmpFolder, { recursive: true });
    const repo = await DefaultGitRepository.getInstance().init({
      baseDir: tmpFolder,
      clone: { url, branch },
    });

    const pkg = NpmPackage.getByFolder(join(tmpFolder, "package.build.json"));
    if (overwrite && pkg) {
      pkg.name = overwrite.name;
      pkg.namespace = overwrite.namespace;
      writeFileSync(
        join(tmpFolder, "package.build.json"),
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

  //   static async addFromUrl({
  //     url,
  //     branch,
  //     overwrite,
  //     copyFolder,
  //   }: AddSubmoduleArgs): Promise<DefaultSubmodule> {
  //     // if (!global.ONCE) global.ONCE = await Once.start();
  //     // const root = ONCE?.eamd?.eamdDirectory;
  //     // if (!root) throw new Error("EAMD.ucp not defined");

  //     // const tmpFolder = join(root, "tmp");
  //     // !existsSync(tmpFolder) && mkdirSync(tmpFolder);

  //     // const repo = await DefaultGitRepository.getInstance().init({
  //     //   baseDir: join(root, "tmp"),
  //     //   clone: { url, branch },
  //     // });

  //     // const pkg = await NpmPackage.getByFolder(tmpFolder);

  //     // execSync(`npm install --prefix ${tmpFolder}`);
  //     // if (overwrite && pkg) {
  //     //   pkg.name = overwrite.name;
  //     //   pkg.namespace = overwrite.namespace;
  //     //   writeFileSync(
  //     //     join(tmpFolder, "package.json"),
  //     //     JSON.stringify(pkg, null, 2),
  //     //     { flag: "w+" }
  //     //   );
  //     // }

  //     // const eamdRepo = await DefaultGitRepository.getInstance().init({
  //     //   baseDir: root,
  //     // });
  //     // const sub = await eamdRepo.addSubmodule(
  //     //   repo,
  //     //   join(eamdRepo.folderPath, getdevFolder(repo))
  //     // );
  //     // if (!sub) throw new Error("....TODO..");
  //     // rmSync(tmpFolder, { recursive: true });
  //     // return sub;
  //     throw new Error("TODO");
  //   }
  // }

  // type AddSubmoduleArgs = {
  //   url: string;
  //   branch?: string;
  //   overwrite?: { name: string; namespace: string };
  //   copyFolder?: string[];
  // };

  // // TODO refactor
  // function getdevFolder(repo: GitRepository) {
  //   const npmPackage = NpmPackage.getByFolder(repo.folderPath);
  //   if (!npmPackage) throw new Error("TODO");

  //   const split = npmPackage.namespace?.split(".");
  //   const packageFolder = split ? split : ["empty"];

  //   return join("Components", ...packageFolder, npmPackage.name || "", "dev");
}
