import EAMD from "../../3_services/EAMD.interface";
import Once, { OnceMode, OnceState } from "../../3_services/Once.interface";
import { RootEAMD } from "../EAMD/RootEAMD.class";
import { UserEAMD } from "../EAMD/UserEAMD.class";
import { BaseNodeOnce } from "../../1_infrastructure/BaseNodeOnce.class";

import fs from "fs";
export default class OnceNodeServer extends BaseNodeOnce implements Once {

  init(...a: any[]) {
    throw new Error("Method not implemented.");
  }
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
    //@ts-ignore
    // await import("ior:esm:git:tla.EAM.Once.cli");

    //@ts-ignore
    //await import("ior:esm:git:tla.EAM.MarcelDonges[myBranch]");

    return this;
  }

  static async start(): Promise<Once> {
    // WATCHMODE
    if (process.env.NODE_ENV === "watch") {
      setInterval(function () {
        console.log("timer that keeps nodejs processing running");
      }, 1000 * 60 * 60);
    }

    console.log("ONCE STARTED AS NODE_JS");
    const once = new OnceNodeServer(await this.initEAMD());

    //HACK: Should be dynamic
    await import("../Things/FilePersistanceManager.class");


    // if (once.eamd && once.eamd.eamdRepository) {
    //   const submodules = await once.eamd.eamdRepository.getSubmodules();
    //   const isOnceCliInstalled = submodules.some(
    //     (x) => x.path?.indexOf("once.cli") !== -1
    //   );
    //   if (!isOnceCliInstalled) {
    //     const cli = DefaultSubmodule.addFromRemoteUrl({
    //       url: "https://github.com/ONCE-DAO/once.cli.git",
    //       once,
    //     });
    //   }
    // }
    return once;
  }

  get scenarioPath(): string {
    let path = process.cwd();
    if (path.match('/Scenarios/')) return path;

    if (this.mode === OnceMode.NODE_JS) {
      const pathList = path.split('/');
      while (pathList.length > 1) {
        let scenarioPath = pathList.join('/') + '/EAMD.ucp/Scenarios/'
        if (fs.existsSync(scenarioPath)) {
          scenarioPath += 'localhost/'
          if (!fs.existsSync(scenarioPath)) {
            fs.mkdirSync(scenarioPath)
          }
          return scenarioPath;
        }

        pathList.pop();

      }
    }
    throw new Error("Could not find scenario path");

  };

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
