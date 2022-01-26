import {
  Once as OnceInterface,
  OnceInstallationMode,
  OnceMode,
  OnceState,
} from "../3_services/Once.interface";
import { Server } from "../3_services/Server.interface";
import { NodeLoader } from "../3_services/NodeLoader.interface";
import fs from "fs";
import os from "os";
import path from "path";

export abstract class AbstractOnce implements OnceInterface {
  server: Server[] = [];
  onces: AbstractOnce[] = [];

  protected creationDate: number;
  protected mode: OnceMode = OnceMode.BOOTING;
  protected state: OnceState = OnceState.DISCOVER;
  protected installationMode: OnceInstallationMode =
    OnceInstallationMode.TRANSIENT;

  static async start(): Promise<AbstractOnce> {
    throw new Error("Not implemented in abstract class");
  }

  protected constructor() {
    this.onces.push(this);
    this.creationDate = Date.now();
  }

  get nodeLoader(): NodeLoader | undefined {
    const loader =
      this.mode === OnceMode.NODE_LOADER
        ? this
        : this.onces.find((o) => o.mode === OnceMode.NODE_LOADER);
    if (loader) return loader as unknown as NodeLoader;
    return loader;
  }

  // #region Runtime helper
  protected static get isBrowser() {
    return (
      typeof window !== "undefined" && typeof window.document !== "undefined"
    );
  }

  protected static get isNodeLoader() {
    return AbstractOnce.isNodeRuntime && global.ONCE === undefined;
  }

  protected static get isNode() {
    return AbstractOnce.isNodeRuntime && global.ONCE !== undefined;
  }

  protected static get isNodeRuntime() {
    return (
      typeof process !== "undefined" &&
      process.versions != null &&
      process.versions.node != null
    );
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

  protected static get isRepoInstalled() {
    return (
      fs.existsSync("/EAMD.ucp") ||
      fs.existsSync("/var/EAMD.ucp") ||
      fs.existsSync(path.join(os.userInfo().homedir, "EAMD.ucp"))
    );
  }
  // #endregion
}
