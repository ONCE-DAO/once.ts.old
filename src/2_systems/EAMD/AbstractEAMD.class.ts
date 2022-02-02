import { execSync } from "child_process";
import { W_OK } from "constants";
import { accessSync, existsSync, mkdirSync, rm, rmSync } from "fs";
import { join } from "path";
import { EAMD } from "../../3_services/EAMD.interface";
import { EAMDGitRepository } from "../Git/EAMDGitRepository.class";
import { GitRepository } from "../Git/GitRepository.class";
import { NpmPackage } from "../NpmPackage.class";

function getdevFolder(repo: GitRepository) {
  const npmPackage = NpmPackage.getByFolder(repo.folderPath);
  if (!npmPackage) throw new Error("TODO");

  const split = npmPackage.namespace?.split(".");
  const packageFolder = split ? split : ["empty"];

  return join("Components", ...packageFolder, npmPackage.name || "", "dev");
}

export abstract class AbstractEAMD implements EAMD {
  private static readonly EAMD = "EAMD.ucp";
  installedAt: Date | undefined;
  preferredFolder: string[] = [];
  folder: string | undefined;
  eamdPath: string | undefined;

  static getInstance(): EAMD {
    throw new Error("Not implemented in abstract class");
  }

  static getInstalled(): EAMD {
    const instance = this.getInstance();
    instance.folder = instance.preferredFolder.find((folder) =>
      existsSync(join(folder, AbstractEAMD.EAMD))
    );
    if (!instance.folder) throw new Error("can't find installed eamd");

    instance.eamdPath = join(instance.folder, AbstractEAMD.EAMD);
    if (!instance.eamdPath) throw new Error("repository is not installed");
    console.log("EAMD returned with path", instance.eamdPath);
    return this.getInstance().init(instance.eamdPath);
  }

  static isInstalled(): boolean {
    return this.getInstance().preferredFolder.some((folder) =>
      existsSync(join(folder, this.EAMD))
    );
  }
  static hasWriteAccess(): boolean {
    return this.getInstance().preferredFolder.some((folder) =>
      this.hasWriteAccessFor(folder)
    );
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

  async install(): Promise<EAMD> {
    if (!this.folder)
      this.folder = this.preferredFolder.find((folder) =>
        AbstractEAMD.hasWriteAccessFor(folder)
      );

    if (!this.folder) throw new Error("path is not initialised");
    this.eamdPath = join(this.folder, AbstractEAMD.EAMD);
    if (!this.eamdPath) throw new Error("eamdPath is not initialised");

    mkdirSync(this.eamdPath, { recursive: true });
    mkdirSync(join(this.eamdPath, "Components"), { recursive: true });

    // init new local repo
    const eamdRepo = await EAMDGitRepository.newInstance.init({
      baseDir: this.eamdPath,
      init: true,
    });
    // get current repo
    const oncetsRepo = await GitRepository.newInstance.init({
      baseDir: process.cwd(),
    });

    const oncetsSubmodule = await eamdRepo.addSubmodule(
      oncetsRepo,
      join(eamdRepo.folderPath, getdevFolder(oncetsRepo))
    );
    oncetsSubmodule?.build();

    const onceCliFolder = join(this.folder, "tmpOnceCli");
    mkdirSync(onceCliFolder, { recursive: true });
    const onceCli = await GitRepository.newInstance.init({
      baseDir: onceCliFolder,
      clone: {
        url: "https://github.com/ONCE-DAO/once.cli.git",
      },
    });
    const onceCliSubmodule = await eamdRepo.addSubmodule(
      onceCli,
      join(eamdRepo.folderPath, getdevFolder(onceCli))
    );
    onceCliSubmodule?.build(["bin"], ["link"]);

    rmSync(onceCliFolder, { recursive: true });
    //TODO install once.cli as submodule
    //TODO install once.webServer as submodule
    //TODO install once.browser as submodule
    this.installedAt = new Date();
    //TODO store installedAt
    console.log("EAMD installed at path", this.eamdPath);
    return this.init(this.folder);
  }

  init(path: string): EAMD {
    //TODO recover installedAt
    this.eamdPath = path;
    this.folder = join(this.eamdPath, "..");
    //TODO build all Submodules
    console.log("EAMD initialised with path", this.eamdPath);
    return this;
  }

  update(): Promise<EAMD> {
    //TODO implement
    throw new Error("Method not implemented.");
  }
  test(): void {
    //TODO implement
    throw new Error("Method not implemented.");
  }
}
