import { OnceMode, OnceState } from "../../3_services/Once.interface";
import { Once as OnceInterface } from "../../3_services/Once.interface";
import { AbstractEAMD } from "../EAMD/AbstractEAMD.class";

export abstract class BaseOnce implements OnceInterface {
  private creationDate: Date;
  public mode: OnceMode = OnceMode.BOOTING;
  protected state: OnceState = OnceState.DISCOVER;
  protected eamdRepository: AbstractEAMD | undefined;

  protected constructor(global: typeof globalThis) {
    this.creationDate = new Date();
  }

  abstract startAsync(): Promise<BaseOnce>;
  abstract getEAMDRepository(): Promise<AbstractEAMD | undefined>;

  static async start(): Promise<BaseOnce> {
    console.log("Once.class static start");
    const once = await this.discover();
    once.eamdRepository = await once.getEAMDRepository();
    await once.startAsync();
    console.log(
      `ONCE
       created [${once.creationDate.toISOString()}] 
       installed [${
         once.eamdRepository === undefined
           ? false
           : once.eamdRepository.installedAt?.toISOString()
       }]
       mode [${once.mode}]
       state [${once.state}]`
    );
    return once;
  }

  static async discover(): Promise<BaseOnce> {
    throw new Error("Not implemented in BaseClass");
  }

  protected static get isBrowser() {
    return (
      typeof window !== "undefined" && typeof window.document !== "undefined"
    );
  }

  protected static get isNode() {
    return (
      typeof process !== "undefined" &&
      process.versions != null &&
      process.versions.node != null
    );
  }

  protected static async isNodeLoader(): Promise<boolean> {
    if (global.ONCE === undefined) {
      // any import would be hooked and set global.ONCE to NodeLoaderOnceInstance
      await import("./NodeLoaderOnce.js");
      if (global.ONCE !== undefined) return true;
    }
    return false;
  }

  protected static get isWebWorker() {
    return (
      typeof self === "object" &&
      self.constructor &&
      self.constructor.name === "DedicatedWorkerGlobalScope"
    );
  }

  protected static get isServiceWorker() {
    return (
      typeof self === "object" &&
      self.constructor &&
      self.constructor.name === "ServiceWorkerGlobalScope"
    );
  }

  protected static get isServiceWorkerSupported() {
    return navigator && "serviceWorker" in navigator;
  }
}
