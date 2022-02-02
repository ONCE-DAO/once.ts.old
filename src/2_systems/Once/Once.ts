import { BaseOnce } from "./BaseOnce.class";

declare global {
  var ONCE: BaseOnce | undefined;
}

export abstract class Once extends BaseOnce {
  static async discover(): Promise<BaseOnce> {
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
