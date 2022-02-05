import { BaseEAMD } from "../../1_infrastructure/BaseEAMD.class";

export class RootEAMD extends BaseEAMD {
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
