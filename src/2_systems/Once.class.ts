import { BaseOnce } from "./Once/BaseOnce.class";

declare global {
    var ONCE: BaseOnce | undefined;
  }
  
export abstract class Once extends BaseOnce {
  static async discover(): Promise<BaseOnce> {
    console.log("Start discovering once by runtime");

    if (this.isNode) {
      if ((await this.isNodeLoader()) && global.ONCE) return global.ONCE;
      return (await import("./Once/OnceNodeServer.class.js")).OnceNodeServer.getInstance;
    }
    if (this.isBrowser){

    }
    return (await import("./Once/NotDiscovered.js")).NotDiscovered.instance;
  }
}

Once.start();

// nodeLoader hooks
import { load, resolve } from "./Once/OnceNodeImportLoader";
export { load, resolve };
