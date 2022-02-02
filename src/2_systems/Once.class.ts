import { Once as OnceInterface } from "../3_services/Once.interface";
import { OnceKernel } from "./Once/OnceKernel.class";

declare global {
    var ONCE: OnceInterface | undefined;
  }
  
export abstract class Once extends OnceKernel {
  static async discover(): Promise<OnceInterface> {
    console.log("Start discovering once by runtime");

    if (this.isNode) {
      if ((await this.isNodeLoader()) && global.ONCE) return global.ONCE;
      // TODO replace with new implemented IOR Loader
      // return IOR.load("ior:tla/EAM/Once[5.0.0]/2_services/OnceNodeServer").getInstance
      return (await import("./Once/OnceNodeServer.class.js")).OnceNodeServer.getInstance;
    }
    if (this.isBrowser){

    }
    if(this.isServiceWorker){

    }
    if (this.isWebWorker){

    }
    return (await import("./Once/NotDiscovered.js")).NotDiscovered.instance;
  }
}

Once.start();

// nodeLoader hooks
import { load, resolve } from "./Once/OnceNodeImportLoader";
export { load, resolve };
