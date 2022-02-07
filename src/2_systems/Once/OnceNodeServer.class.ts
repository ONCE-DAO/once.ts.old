import EAMD from "../../3_services/EAMD.interface";
import Once, { OnceMode, OnceState } from "../../3_services/Once.interface";
import { RootEAMD } from "../EAMD/RootEAMD.class";
import { UserEAMD } from "../EAMD/UserEAMD.class";
import BaseThing from "../../1_infrastructure/BaseThing.class";

export default class OnceNodeServer extends BaseThing<Once> implements Once {
  mode = OnceMode.NODE_JS;
  state = OnceState.DISCOVER_SUCCESS;
  eamd: EAMD;
  creationDate: Date;

  private constructor(eamd: EAMD) {
    super();
    this.creationDate = new Date();
    this.eamd = eamd;
  }

  async start(): Promise<Once> {
    return this;
  }

  static async start(): Promise<Once> {
    setInterval(function () {
      console.log("timer that keeps nodejs processing running");
    }, 1000 * 60 * 60);

    console.log("ONCE STARTED AS NODE_JS");

    return new OnceNodeServer(await this.initEAMD());
  }

  static async initEAMD(): Promise<EAMD> {
    const rootEAMD = RootEAMD.getInstance().init();
    if (rootEAMD.hasWriteAccess())
      if (rootEAMD.isInstalled()) return await rootEAMD.getInstalled();
      else return await rootEAMD.install();

    const userEAMD = UserEAMD.getInstance().init();
    if (userEAMD.hasWriteAccess())
      if (userEAMD.isInstalled()) return await userEAMD.getInstalled();
      else return await userEAMD.install();
    throw new Error("User has no access to either root nor user repository");
  }
}
