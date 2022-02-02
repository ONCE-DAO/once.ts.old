import { W_OK } from "constants";
import { accessSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { EAMD } from "../../3_services/EAMD.interface";
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
    mkdirSync(this.eamdPath, { recursive: true });
    this.installedAt = new Date();
    //TODO store installedAt
    console.log("EAMD installed at path", this.eamdPath);

    return this.init(this.folder);
  }

  init(path: string): EAMD {
    //TODO recover installedAt
    this.eamdPath = path;
    this.folder = join(this.eamdPath, "..");
    console.log("EAMD initialised with path", this.eamdPath);

    return this;
  }
}
