import EAMD from "../../3_services/EAMD.interface";
import Once, {
  OnceMode,
  OnceState,
} from "../../3_services/NewOnce/Once.interface";
import { RootEAMD } from "../EAMD/RootEAMD.class";
import { UserEAMD } from "../EAMD/UserEAMD.class";

export default class OnceNodeServer implements Once {
  mode = OnceMode.NODE_JS;
  state = OnceState.DISCOVER_SUCCESS;
  eamd: EAMD;
  creationDate: Date;
  id: string;

  // TODO@PB ask marcel if breaking the empty constructor rule is ok here
  private constructor(id: string, eamd: EAMD) {
    this.creationDate = new Date();
    this.eamd = eamd;
    this.id = id;
  }

  start() {
    return OnceNodeServer.start();
  }

  static async start(): Promise<Once> {
    //TODO@PB
    return new OnceNodeServer("ASK BENE WHAT ID", await this.initEAMD());
  }

  static async initEAMD(): Promise<EAMD> {
    if (await RootEAMD.hasWriteAccess())
      if (await RootEAMD.isInstalled()) return await RootEAMD.getInstalled();
      else return await RootEAMD.install();
    if (await UserEAMD.hasWriteAccess())
      if (await UserEAMD.isInstalled()) return await UserEAMD.getInstalled();
      else return await UserEAMD.install();
    throw new Error("User has no access to either root nor user repository");
  }
}
