import { OnceKernel } from "./OnceKernel.class";
import { Once as OnceInterface } from "../../3_services/Once.interface"

declare global {
  var ONCE: OnceInterface | undefined;
}

export abstract class Once extends OnceKernel {
  static async discover(): Promise<OnceInterface> {
    console.log("Start discovering once by runtime");

    if (this.isNode) {
      // if ((await this.isNodeLoader()) && global.ONCE) return global.ONCE;
      // TODO replace with new implemented IOR Loader
      // return IOR.load("ior:tla/EAM/Once[5.0.0]/2_services/OnceNodeServer").getInstance
      return (await import("./OnceNodeServer.class.js")).OnceNodeServer
        .getInstance;
    }
    if (this.isBrowser) {
    }
    if (this.isServiceWorker) {
    }
    if (this.isWebWorker) {
    }
    return (await import("./NotDiscovered.js")).NotDiscovered.instance;
  }
}
