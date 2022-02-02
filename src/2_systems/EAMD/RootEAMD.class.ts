import { EAMD } from "../../3_services/EAMD.interface";
import { AbstractEAMD } from "./AbstractEAMD.class";

export class RootEAMD extends AbstractEAMD {
  preferredFolder = ["/", "/var"];

  static getInstance(): EAMD {
    return new RootEAMD();
  }

  async install(): Promise<EAMD> {
    const eamd = super.install();
    return eamd;
  }

  init(path: string): EAMD {
    const eamd = super.init(path);
    return eamd;
  }
}
