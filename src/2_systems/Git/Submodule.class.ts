import { execSync } from "child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  renameSync,
  rmSync,
  symlinkSync,
  unlinkSync,
  writeFileSync,
} from "fs";
import { basename, join } from "path";
import { EAMD_FOLDERS } from "../../3_services/EAMD.interface";
import { NpmPackage } from "../NpmPackage.class";
import { Once } from "../Once.class";
import { GitRepository } from "./GitRepository.class";

//TODO @PB Refactor code
export class Submodule {
  path: string | undefined;

  static getInstance() {
    const instance = new Submodule();
    return instance;
  }

  async init(path: string): Promise<Submodule> {
    this.path = path;
    return this;
  }

  build(copyFolder?: string[], npmCommands?: string[]) {
    if (!this.path) throw new Error("...");

    // install deps
    execSync(`npm install --prefix ${this.path}`);
    const npmPackage = NpmPackage.getByFolder(this.path);

    const snapshot = npmPackage?.name;
    const version = `${npmPackage?.version}-SNAPSHOT-${snapshot}`;
    // write tsconfig extensin
    writeFileSync(
      join(this.path, "tsconfig.build.json"),
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

    execSync(`npm --prefix ${this.path} run build:version`);

    existsSync(join(this.path, "node_modules")) &&
      cpSync(
        join(this.path, "node_modules"),
        join(this.path, version, "node_modules"),
        { recursive: true }
      );

    existsSync(join(this.path, "ressources")) &&
      cpSync(
        join(this.path, "ressources"),
        join(this.path, version, "ressources"),
        { recursive: true }
      );
    cpSync(
      join(this.path, "package.json"),
      join(this.path, version, "package.json"),
      { recursive: true }
    );

    writeFileSync(
      join(
        this.path,
        version,
        `${npmPackage?.name}.${npmPackage?.version
          ?.replace(/\./g, "_")
          .replace("/", "-")}.component.xml`
      ),
      ""
    );

    copyFolder &&
      copyFolder.forEach((f) => {
        existsSync(join(this.path || "", f)) &&
          cpSync(join(this.path || "", f), join(this.path || "", version, f), {
            recursive: true,
          });
      });
    const dist = join(this.path, "..", "..", EAMD_FOLDERS.DIST, version);

    const current = join(dist, "..", EAMD_FOLDERS.CURRENT);
    if (existsSync(dist)) {
      console.log("DIST", dist);
      rmSync(dist, { recursive: true });
      unlinkSync(current);
    }

    mkdirSync(dist, { recursive: true });

    renameSync(join(this.path, version), dist);
    symlinkSync(dist, current);

    npmCommands &&
      npmCommands.forEach((npmCommand) => {
        npmCommand === "install" || npmCommand === "link"
          ? execSync(`npm ${npmCommand} --prefix ${dist}`)
          : execSync(`npm --prefix ${dist} run ${npmCommand}`);
      });
  }

  static async addFromUrl({
    url,
    branch,
    overwrite,
    copyFolder,
  }: AddSubmoduleArgs): Promise<Submodule> {
    if (!global.ONCE) global.ONCE = await Once.start();
    const root = ONCE?.eamd?.eamdPath;
    if (!root) throw new Error("EAMD.ucp not defined");

    const tmpFolder = join(root, "tmp");
    !existsSync(tmpFolder) && mkdirSync(tmpFolder);

    const repo = await GitRepository.getInstance.init({
      baseDir: join(root, "tmp"),
      clone: { url, branch },
    });

    const pkg = await NpmPackage.getByFolder(tmpFolder);

    execSync(`npm install --prefix ${tmpFolder}`);
    if (overwrite && pkg) {
      pkg.name = overwrite.name;
      pkg.namespace = overwrite.namespace;
      writeFileSync(
        join(tmpFolder, "package.json"),
        JSON.stringify(pkg, null, 2),
        { flag: "w+" }
      );
    }

    const eamdRepo = await GitRepository.getInstance.init({ baseDir: root });
    const sub = await eamdRepo.addSubmodule(
      repo,
      join(eamdRepo.folderPath, getdevFolder(repo))
    );
    if (!sub) throw new Error("....TODO..");
    rmSync(tmpFolder, { recursive: true });
    return sub;
  }
}

type AddSubmoduleArgs = {
  url: string;
  branch?: string;
  overwrite?: { name: string; namespace: string };
  copyFolder?: string[];
};

// TODO refactor
function getdevFolder(repo: GitRepository) {
  const npmPackage = NpmPackage.getByFolder(repo.folderPath);
  if (!npmPackage) throw new Error("TODO");

  const split = npmPackage.namespace?.split(".");
  const packageFolder = split ? split : ["empty"];

  return join("Components", ...packageFolder, npmPackage.name || "", "dev");
}
