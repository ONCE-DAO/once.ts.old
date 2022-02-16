import EAMD from "../../3_services/EAMD.interface";
import { BaseEAMD } from "../../1_infrastructure/BaseEAMD.class";
import os from "os";
import path, { join } from "path";

export class UserEAMD extends BaseEAMD {
  preferredFolder = [os.userInfo().homedir+"/Development"];

  static getInstance(): UserEAMD {
    return new UserEAMD();
  }
  getInstallDirectory(): string | undefined {
    return super.getInstallDirectory() || join(process.cwd(), "..");
  }

  async install() {
    const eamd = super.install();
    return eamd;
  }

  init() {
    const eamd = super.init();
    return eamd;
  }
}
