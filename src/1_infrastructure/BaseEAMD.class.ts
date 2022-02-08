import { W_OK } from "constants";
import { accessSync, existsSync, mkdirSync, rmSync, symlinkSync } from "fs";
import { join, relative } from "path";
import EAMD, { EAMD_FOLDERS } from "../3_services/EAMD.interface";
import GitRepositoryInterface from "../3_services/GitRepository.interface";
import DefaultGitRepository from "../2_systems/Git/GitRepository.class";
import { execSync } from "child_process";

export abstract class BaseEAMD implements EAMD {
  installedAt: Date | undefined;
  preferredFolder: string[] = [];
  installationDirectory: string | undefined;
  eamdDirectory: string | undefined;
  eamdRepository: GitRepositoryInterface | undefined;

  static getInstance(): BaseEAMD {
    throw new Error("Not implemented in abstract class");
  }

  get class(): ThisType<BaseEAMD> {
    return BaseEAMD.prototype;
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
    this.eamdRepository = await DefaultGitRepository.getInstance().init({
      baseDir: this.eamdDirectory,
    });

    // TODO make Parallel
    (await this.eamdRepository.getSubmodules()).forEach((submodule) => {
      //TODO@MD ENUMs for static constant
      if (process.env.NODE_ENV === "watch") {
        submodule?.watch(eamdDirectory);
      }
      if (process.env.NODE_ENV === "build_pkg") {
        submodule.installDependencies(eamdDirectory);
      }
      if (
        process.env.NODE_ENV === "build" ||
        process.env.NODE_ENV === "build_pkg"
      ) {
        submodule.build(eamdDirectory);
        submodule.afterbuild(eamdDirectory);
      }
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
    console.log("EAMD install");

    if (!this.eamdDirectory)
      throw new Error("cant install if directory not exists");
    mkdirSync(this.eamdDirectory, { recursive: true });
    this.eamdRepository = await DefaultGitRepository.getInstance().init({
      baseDir: this.eamdDirectory,
      clone: { url: "https://github.com/ONCE-DAO/EAMD.ucp.git" },
    });

    execSync(`npm install --prefix ${this.eamdDirectory}`);
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

    const oncetsSubmodule = await this.eamdRepository?.addSubmodule(oncetsRepo);

    if (oncetsSubmodule.path) {
      const tmpPath = oncetsSubmodule.path;
      oncetsSubmodule.path = relative(this.eamdDirectory, oncetsSubmodule.path);

      if (oncetsSubmodule.path.startsWith("..")) oncetsSubmodule.path = tmpPath;

      oncetsSubmodule?.installDependencies(this.eamdDirectory);
      oncetsSubmodule?.build(this.eamdDirectory);
      oncetsSubmodule?.afterbuild(this.eamdDirectory);
      if (process.env.NODE_ENV === "development")
        oncetsSubmodule?.watch(this.eamdDirectory);
    }
    //TODO install once.cli as submodule
    //TODO install once.webServer as submodule
    //TODO install once.browser as submodule

    this.installedAt = new Date();
    //TODO@PB store installedAt
    console.log("EAMD installed at path", this.eamdDirectory);

    if (oncetsSubmodule.path) {
      rmSync(process.cwd(), { recursive: true });
      symlinkSync(
        join(this.eamdDirectory, oncetsSubmodule.path),
        join(process.cwd())
      );
    }
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
      "tla.EAM.Once.ts": "https://ithub.com/ONCE-DAO/once.ts",
      "tla.EAM.Once.cli": "https://github.com/ONCE-DAO/once.cli",
      "tla.EAM.MarcelDonges": "https://github.com/temp-phibar/MarcelDonges",
    };
  }
}
