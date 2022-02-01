import { AbstractOnce } from "./AbstractOnce.class";
import { DefaultNodeLoader } from "./DefaultNodeLoader.class";

export class Once extends AbstractOnce {
  static async start(): Promise<Once> {
    console.log("Once started..");

    const once = await this.discoverOnce();
    console.log("Once discovered", once);

    once && console.log("once started", once.mode, once.state);
    return once;
  }

  static async discoverOnce(): Promise<Once> {
    if (
      (this.isNodeRuntime && process.env.NODE_ENV === "install_once") ||
      !this.isRepoInstalled
    ) {
      console.log("INSTALL ");
      
      const OnceInstaller = (await import("../unsorted/OnceInstaller.class.js"))
        .OnceInstaller;
      const once = OnceInstaller.start();
  
      return once;
    }

    if (this.isNodeLoader) {
      global.ONCE = await DefaultNodeLoader.start();
      return global.ONCE;
    } else if (this.isNode) {
      const OnceExpress = (
        await import(
          // @ts-ignore
          "./../../../once.nodeJs@main/src/2_systems/OnceExpress.js"
        )
      ).OnceExpress;
      const once = await OnceExpress.start();
      global.ONCE = once;
      return once;
    } else if (this.isBrowser) {
      // const BrowserOnce = await (
      //   await import(
      //     // @ts-ignore
      //     '../../../once.browser@main/src/2_systems/BrowserOnce.class.js'
      //   )
      // ).BrowserOnce
      // window.ONCE = await BrowserOnce.start()
      // return window.ONCE
      throw new Error("Not implemented");
    } else if (this.isServiceWorker) {
      throw new Error("Not implemented");
      // (await ServiceWorkerOnce.start()).addEventListener(self)
    } else if (this.isWebWorker) {
      throw new Error("not implemented");
    }

    throw new Error("ONCE not discovered, maybe ");
  }
  // #endregion
}

const load = DefaultNodeLoader.loadHook;
const resolve = DefaultNodeLoader.resolveHook;
export { load, resolve };

Once.start();
