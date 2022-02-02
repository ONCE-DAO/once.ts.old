import { BaseOnce } from "./BaseOnce.class";

export abstract class Once extends BaseOnce {
  static async discover(): Promise<BaseOnce> {
    console.log("Start discovering once by runtime");

    if (this.isNode) {
      if ((await this.isNodeLoader()) && global.ONCE) return global.ONCE;
      return (await import("./NodeOnce.class.js")).NodeOnce.newInstance;
    }
    return (await import("./NotDiscovered.js")).NotDiscovered.instance;
  }
}

Once.start();

// nodeLoader hooks
import { load, resolve } from "./NodeLoaderOnce";
export { load, resolve };
