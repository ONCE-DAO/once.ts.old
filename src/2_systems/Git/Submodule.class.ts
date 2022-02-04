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
import GitRepository from "../../3_services/NewOnce/GitRepository.interface";
import Submodule, {
  AddSubmoduleArgs,
} from "../../3_services/NewOnce/Submodule.interface";
import { NpmPackage } from "../NpmPackage.class";
import { Once } from "../Once/Once";
import UcpComponentDescriptor from "../UcpComponentDescriptor.class";
import DefaultGitRepository from "./GitRepository.class";

//TODO @PB Refactor code
export default class DefaultSubmodule implements Submodule {
  path: string | undefined;

  watch(eamdPath: string): Promise<void> {
    throw new Error("Method not implemented.");
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

  private copyFolder(path: string, version: string, name: string) {
    existsSync(join(path, name)) &&
      cpSync(join(path, name), join(path, version, name), { recursive: true });
  }

  build(eamdPath: string) {
    if (!this.path) throw new Error("Submodule does not exist");
    const fullPath = join(eamdPath, this.path);
    const npmPackage = NpmPackage.getByFolder(fullPath);
    const snapshot = npmPackage?.name;
    const version = `${npmPackage?.version}-SNAPSHOT-${snapshot}`;
    this.npmBuild(fullPath, version);
    this.copyFolder(fullPath, version, "ressources");
    this.copyFolder(fullPath, version, "package.json");
    this.copyFolder(fullPath, version, "bin");
    UcpComponentDescriptor.getInstance()
      .init(fullPath)
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
    execSync(`npm --prefix ${dist} run build:version:after`);
    console.log("build")
  }

  async init(path: string): Promise<Submodule> {
    this.path = path;
    return this;
  }

  static getInstance() {
    const instance = new DefaultSubmodule();
    return instance;
  }

  addFromRemoteUrl(args: AddSubmoduleArgs): Promise<Submodule> {
    throw new Error("Method not implemented.");
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
