import EAMD from "../../3_services/EAMD.interface";
import { DefaultEAMD } from "./DefaultEAMD.class";

export class RootEAMD extends DefaultEAMD {
  preferredFolder = ["/", "/var"];

  static getInstance() {
    return new RootEAMD();
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
