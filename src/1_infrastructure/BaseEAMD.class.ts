import { W_OK } from "constants";
import { accessSync, existsSync, mkdirSync, rmSync, symlinkSync } from "fs";
import { basename, join, relative } from "path";
import EAMD, { EAMD_FOLDERS } from "../3_services/EAMD.interface";
import GitRepositoryInterface from "../3_services/GitRepository.interface";
import DefaultGitRepository from "../2_systems/Git/GitRepository.class";
import { NpmPackage } from "../2_systems/NpmPackage.class";

// HACK
// TODO@PB
// REFACTOR
function getdevFolder(repo: GitRepositoryInterface) {
  const npmPackage = NpmPackage.getByFolder(repo.folderPath);
  if (!npmPackage) throw new Error("TODO");

  const split = npmPackage.namespace?.split(".");
  const packageFolder = split ? split : [EAMD_FOLDERS.MISSING_NAMESPACE];

  return join(
    EAMD_FOLDERS.COMPONENTS,
    ...packageFolder,
    npmPackage.name || "",
    EAMD_FOLDERS.DEV
  );
}

export abstract class BaseEAMD implements EAMD {
  installedAt: Date | undefined;
  preferredFolder: string[] = [];
  installationDirectory: string | undefined;
  eamdDirectory: string | undefined;
  eamdRepository: GitRepositoryInterface | undefined;

  static getInstance(): BaseEAMD {
    throw new Error("Not implemented in abstract class");
  }

  hasWriteAccess(): boolean {
    if (this.installationDirectory)
      return BaseEAMD.hasWriteAccessFor(this.installationDirectory);
    return false;
  }
  isInstalled(): boolean {
    if (this.eamdDirectory) return existsSync(this.eamdDirectory);
    return false;
  }
  async getInstalled() {
    const eamdDirectory = this.eamdDirectory;
    if (!eamdDirectory) throw new Error("no eamd directory");
    if (!existsSync(eamdDirectory))
      throw new Error("can't find installed eamd");
    console.log("EAMD returned with path", eamdDirectory);
    const eamdRepository = await DefaultGitRepository.getInstance().init({
      baseDir: this.eamdDirectory,
    });

    (await eamdRepository.getSubmodules()).forEach((submodule) => {
      submodule.installDependencies(eamdDirectory);
      submodule.build(eamdDirectory);
      //TODO@MD ENUMs for static constant
      process.env.node_env === "development" && submodule?.watch(eamdDirectory);
    });
    return this;
  }

  getInstallDirectory(): string | undefined {
    return this.preferredFolder.find((folder) =>
      BaseEAMD.hasWriteAccessFor(folder)
    );
  }
  init(): EAMD {
    this.installationDirectory = this.getInstallDirectory();
    if (this.installationDirectory)
      this.eamdDirectory = join(this.installationDirectory, EAMD_FOLDERS.ROOT);
    return this;
  }
  async install(): Promise<EAMD> {
    if (!this.eamdDirectory)
      throw new Error("cant install if directory not exists");
    mkdirSync(this.eamdDirectory, { recursive: true });
    this.eamdRepository = await DefaultGitRepository.getInstance().init({
      baseDir: this.eamdDirectory,
      clone: { url: "https://github.com/ONCE-DAO/EAMD.ucp.git" },
    });
    //TODO@PB remove origin ;)
    mkdirSync(join(this.eamdDirectory, EAMD_FOLDERS.COMPONENTS), {
      recursive: true,
    });
    mkdirSync(join(this.eamdDirectory, EAMD_FOLDERS.SCENARIOS), {
      recursive: true,
    });
    // get current repo
    const oncetsRepo = await DefaultGitRepository.getInstance().init({
      baseDir: process.cwd(),
    });

    if (!this.eamdRepository || !oncetsRepo) throw new Error("TODO");

    const devFolder = join(
      this.eamdRepository.folderPath,
      getdevFolder(oncetsRepo)
    );

    const oncetsSubmodule = await this.eamdRepository?.addSubmodule(
      oncetsRepo,
      devFolder
    );

    if (oncetsSubmodule.path) {
      oncetsSubmodule.path = relative(this.eamdDirectory, oncetsSubmodule.path);
      oncetsSubmodule?.installDependencies(this.eamdDirectory);
      oncetsSubmodule?.build(this.eamdDirectory);
      process.env.node_env === "development" &&
        oncetsSubmodule?.watch(this.eamdDirectory);
    }
    //TODO install once.cli as submodule
    //TODO install once.webServer as submodule
    //TODO install once.browser as submodule

    this.installedAt = new Date();
    //TODO@PB store installedAt
    console.log("EAMD installed at path", this.eamdDirectory);

    // TODO incomment later
    // if (oncetsSubmodule.path && devFolder) {
    //   rmSync(process.cwd(), { recursive: true });
    //   symlinkSync(
    //     join(this.eamdDirectory,oncetsSubmodule.path ),
    //     join(process.cwd())
    //     // process.kill(process.pid)
    //   );
    // }
    return this;
  }
  update(): Promise<EAMD> {
    //TODO@PB implement
    throw new Error("Method not implemented.");
  }
  test(): void {
    //TODO@PB implement
    throw new Error("Method not implemented.");
  }

  private static hasWriteAccessFor(path: string): boolean {
    try {
      accessSync(path, W_OK);
      return true;
    } catch {
      return false;
    }
  }

  async discover(): Promise<object> {
    return {
      "tla.EAM.Once.ts": "github.com/ONCE-DAO/EAMD.ucp.git",
      "tla.EAM.Once.cli": "github.com/ONCE-DAO/once.cli.git",
    };
  }
}
