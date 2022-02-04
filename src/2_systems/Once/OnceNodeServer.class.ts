import { Once, OnceMode, OnceState } from "../../3_services/Once.interface";
import { OnceKernel } from "./OnceKernel.class";
import { DefaultEAMD } from "../EAMD/DefaultEAMD.class";
import { Environment } from "../../3_services/Enviroment.interface";
import { RootEAMD } from "../EAMD/RootEAMD.class";
import { UserEAMD } from "../EAMD/UserEAMD.class";

export class OnceNodeServer extends OnceKernel implements Environment {
  ENV = process.env;
  public mode = OnceMode.NODE_JS;
  state = OnceState.DISCOVER_SUCESS;

  // static get getInstance() {
  //   return new OnceNodeServer(global);
  // }

  async start(): Promise<Once> {
    console.log("\nStarting OnceNodeServer");
    //TODO start once.webServer
    return this;
  }

  async getEAMD(): Promise<DefaultEAMD | undefined> {
    // if (RootEAMD.hasWriteAccess())
    //   if (RootEAMD.isInstalled()) return RootEAMD.getInstalled();
    //   else return await RootEAMD.install();

    // if (UserEAMD.hasWriteAccess())
    //   if (UserEAMD.isInstalled()) return UserEAMD.getInstalled();
    //   else return await UserEAMD.install();

    throw new Error("User has no access to either root nor user repository");
  }
}
