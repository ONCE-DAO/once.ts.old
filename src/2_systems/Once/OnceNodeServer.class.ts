import { OnceMode, OnceState } from "../../3_services/Once.interface";
import { BaseOnce } from "./BaseOnce.class";
import { AbstractEAMD } from "../EAMD/AbstractEAMD.class";
import { Environment } from "../../3_services/Enviroment.interface";
import { RootEAMD } from "../EAMD/RootEAMD.class";
import { UserEAMD } from "../EAMD/UserEAMD.class";

export class OnceNodeServer extends BaseOnce implements Environment {
  ENV = process.env;
  public mode = OnceMode.NODE_JS;
  protected state = OnceState.DISCOVER_SUCESS;

  static get newInstance() {
    return new OnceNodeServer(global);
  }

  async start(): Promise<BaseOnce> {
    //TODO start once.webServer
    return this;
  }

  async getEAMD(): Promise<AbstractEAMD | undefined> {
    if (await RootEAMD.hasWriteAccess())
      if (await RootEAMD.isInstalled())
        return await RootEAMD.getInstalled();
      else return await RootEAMD.install();

    if (await UserEAMD.hasWriteAccess())
      if (await UserEAMD.isInstalled())
        return await UserEAMD.getInstalled();
      else return await UserEAMD.install();

    throw new Error("User has no access to either root or user repository");
  }
}
