import EAMD from "../../3_services/EAMD.interface";
import { DefaultEAMD } from "./DefaultEAMD.class";
import os from "os";
import path from "path";

export class UserEAMD extends DefaultEAMD {
  preferredFolder = [os.userInfo().homedir];

  static getInstance(): UserEAMD {
    return new UserEAMD();
  }

  async install() {
    const eamd = super.install();
    return eamd;
  }

  init(path: string) {
    const eamd = super.init(path);
    return eamd;
  }
}
