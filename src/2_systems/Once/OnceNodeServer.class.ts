import EAMD from "../../3_services/EAMD.interface";
import Once, { OnceMode, OnceState } from "../../3_services/Once.interface";
import { RootEAMD } from "../EAMD/RootEAMD.class";
import { UserEAMD } from "../EAMD/UserEAMD.class";
import { BaseNodeOnce } from "../../1_infrastructure/BaseNodeOnce.class";
import DefaultSubmodule from "../Git/Submodule.class";

export default class OnceNodeServer extends BaseNodeOnce implements Once {
  get class(): any {
    return OnceNodeServer;
  }
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


  static {
    console.log("OnceNodeServer static was called");
    console.log("OnceNodeServer CAN IT BE INHERITED");
  }

  async start(): Promise<Once> {
    //@ts-ignore
    await import("ior:esm:git:tla.EAM.Once.cli");


    /*
    IOR.pathName  'tla.EAM.OnceService.Once.express'
        TODO add IOR.anchor should be a getter on IOR.hash
    IOR.hash      '/ONCE-DAO/Once.express'
    */
    //@ts-ignore
    // TODO bad
    // await import("ior:github:/ONCE-DAO/Once.express#tla.EAM.OnceService.Once.express");
    
    //@ts-ignore  
    await import("ior:github:tla.EAM.OnceService.Once.express#/ONCE-DAO/Once.express");
    //@ts-ignore
    await import("ior:github:#/ONCE-DAO/Once.express");
    //@ts-ignore
    // TODO false
    await import("ior:github:/ONCE-DAO/Once.express");


    "ior:esm:ns:github:ONCE-DAO/Once.express:https://github.com:8443/some.matched.namespace[0.3.0]"
    

    //@ts-ignore
    await import("ior:github:tla.EAM.OnceSevrice.Once.express#/ONCE-DAO/Once.express");
    


    // "ior:esm:ns:github:tla.EAM.Once.express"
    // "ior:esm:ns:github:tla.EAM.Once.express[main]"
    // "ior:esm:ns:github:tla.EAM.Once.express[0.3.0]"

    // "ior:esm:npm:ONCE-DAO/Once.express"
    // "ior:esm:npm:ONCE-DAO/Once.express[main]"
    // "ior:esm:npm:ONCE-DAO/Once.express[0.3.0]"

    // "ior:esm:github:#ONCE-DAO/Once.express"
    // "ior:esm:github:#ONCE-DAO/Once.express[main]"
    // "ior:esm:github:#ONCE-DAO/Once.express[0.3.0]"
    // "ior:esm:github:https://github.com:8443/#ONCE-DAO/Once.express"
    // "ior:esm:github:https://github.com:8443/#ONCE-DAO/Once.express[main]"
    // "ior:esm:github:https://github.com:8443/some.ignored.namespace#ONCE-DAO/Once.express[0.3.0]"

    // "ior:esm:git:https://github.com:8443/ONCE-DAO/Once.express"
    // "ior:esm:git:https://github.com:8443/ONCE-DAO/Once.express[main]"
    // "ior:esm:git:https://github.com:8443/ONCE-DAO/Once.express[0.3.0]"
    // "ior:esm:git:https://shift.gitlab.com:8443/ONCE-DAO/Once.express"
    // "ior:esm:git:https://shift.gitlab.com:8443/ONCE-DAO/Once.express[main]"
    // "ior:esm:git:https://shift.gitlab.com:8443/ONCE-DAO/Once.express[0.3.0]"

    // "ior:esm:ns:tla.EAM.OnceServices.OnceExpress"
    // "ior:esm:ns:tla.EAM.OnceServices.OnceExpress[main]"
    // "ior:esm:ns:tla.EAM.OnceServices.OnceExpress[0.3.0]"

    // "ior:esm:ns:tla.EAM.OnceServices.OnceExpress"
    // "ior:esm:ns:tla.EAM.OnceServices.OnceExpress[main]"
    // "ior:esm:ns:tla.EAM.OnceServices.OnceExpress[0.3.0]"

    // "ior:esm:file:///tla/EAM/OnceServices/OnceExpress"
    // "ior:esm:file:///tla/EAM/OnceServices/OnceExpress@main"
    // "ior:esm:file:///tla/EAM/OnceServices/OnceExpress@0.3.0"


    // "ior:esm:ipfs:mtwirsqawjuoloq2gvtyug2tc3jbf5htm2zeo4rsknfiv3fdp46a"
    // "ior:esm:ipns:mtwirsqawjuoloq2gvtyug2tc3jbf5htm2zeo4rsknfiv3fdp46a/0.3.0"




    //@ts-ignore
    //await import("ior:esm:git:tla.EAM.MarcelDonges[myBranch]");
    console.log("Once Started")
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
