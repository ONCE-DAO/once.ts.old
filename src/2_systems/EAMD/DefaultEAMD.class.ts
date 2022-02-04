import { W_OK } from "constants";
import { accessSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import EAMD, { EAMD_FOLDERS } from "../../3_services/EAMD.interface";
import GitRepositoryInterface from "../../3_services/NewOnce/GitRepository.interface";
import DefaultGitRepository from "../Git/GitRepository.class";
import { NpmPackage } from "../NpmPackage.class";

// HACK
// TODO@PB
// REFACTOR
function getdevFolder(repo: GitRepositoryInterface) {
  const npmPackage = NpmPackage.getByFolder(repo.folderPath);
  if (!npmPackage) throw new Error("TODO");

  const split = npmPackage.namespace?.split(".");
  const packageFolder = split ? split : ["empty"];

  return join(
    EAMD_FOLDERS.COMPONENTS,
    ...packageFolder,
    npmPackage.name || "",
    EAMD_FOLDERS.DEV
  );
}

export abstract class DefaultEAMD implements EAMD {
  installedAt: Date | undefined;
  preferredFolder: string[] = [];
  installationDirectory: string;
  eamdDirectory: string;
  eamdRepository: GitRepositoryInterface | undefined;

  static getInstance(): DefaultEAMD {
    throw new Error("Not implemented in abstract class");
  }

  static getInstalled() {
    const instance = this.getInstance();
    if (!existsSync(instance.eamdDirectory))
      throw new Error("can't find installed eamd");
    console.log("EAMD returned with path", instance.eamdDirectory);
    return this.getInstance().init(instance.eamdDirectory);
  }

  static isInstalled(): boolean {
    return existsSync(this.getInstance().installationDirectory);
  }

  static hasWriteAccess(): boolean {
    return this.hasWriteAccessFor(this.getInstance().installationDirectory);
  }

  static async install(): Promise<EAMD> {
    return this.getInstance().install();
  }

  private static hasWriteAccessFor(path: string): boolean {
    try {
      accessSync(path, W_OK);
      return true;
    } catch {
      return false;
    }
  }

  constructor() {
    this.installationDirectory = this.getInstallDirectory();
    this.eamdDirectory = join(this.installationDirectory, EAMD_FOLDERS.ROOT);
  }

  /**
   * Iterate through preferred folder and return first which is writeable by the user
   * if none of the preferred is accessable it returns the parent
   * @returns
   */
  getInstallDirectory(): string {
    return (
      this.preferredFolder.find((folder) =>
        DefaultEAMD.hasWriteAccessFor(folder)
      ) || join(process.cwd(), "..")
    );
  }

  async install(): Promise<EAMD> {
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

    const oncetsSubmodule = await this.eamdRepository?.addSubmodule(
      oncetsRepo,
      join(this.eamdRepository.folderPath, getdevFolder(oncetsRepo))
    );
    oncetsSubmodule?.build();

    // // HACK refactor to loader
    // const onceCliFolder = join(this.folder, "tmpOnceCli");
    // mkdirSync(onceCliFolder, { recursive: true });
    // const onceCli = await GitRepository.getInstance.init({
    //   baseDir: onceCliFolder,
    //   clone: {
    //     url: "https://github.com/ONCE-DAO/once.cli.git",
    //   },
    // });
    // const onceCliSubmodule = await eamdRepo.addSubmodule(
    //   onceCli,
    //   join(eamdRepo.folderPath, getdevFolder(onceCli))
    // );
    // onceCliSubmodule?.build(["bin"], ["link"]);
    // rmSync(onceCliFolder, { recursive: true });

    //TODO install once.webServer as submodule
    //TODO install once.browser as submodule
    this.installedAt = new Date();
    //TODO@PB store installedAt
    console.log("EAMD installed at path", this.eamdDirectory);
    return this.init(this.installationDirectory);
  }

  init(path: string): EAMD {
    //TODO@PB recover installedAt
    this.eamdDirectory = path;
    this.installationDirectory = join(this.eamdDirectory, "..");
    //TODO@PB build all Submodules
    // await this.update()

    console.log("EAMD initialised with path", this.eamdDirectory);
    return this;
  }

  update(): Promise<EAMD> {
    //TODO@PB implement
    throw new Error("Method not implemented.");
  }
  test(): void {
    //TODO implement
    throw new Error("Method not implemented.");
  }

  async discover(): Promise<object> {
    return {
      "tla.EAM.Once.ts": "github.com/ONCE-DAO/EAMD.ucp.git",
      "tla.EAM.Once.cli": "github.com/ONCE-DAO/once.cli.git",
    };
  }
}
