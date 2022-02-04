import Once, { OnceRuntimeResolver } from "../3_services/Once.interface";

export abstract class BaseOnce {
  static async start(): Promise<Once> {
    const once: Once = await this.discover();
    return await once.start();
  }

  static async discover(): Promise<Once> {
    console.log("START DISCOVER");

    if (this.RuntimeIs.NODE_LOADER()) {
      return (await import("../2_systems/Once/OnceNodeImportLoader.class.js")).default
        .getInstance();
    }
    if (this.RuntimeIs.NODE_JS()) {
      return (await import("../2_systems/Once/OnceNodeServer.class.js")).default.start();
    }
    if (this.RuntimeIs.BROWSER()) {
    }
    if (this.RuntimeIs.SERVICE_WORKER()) {
    }
    if (this.RuntimeIs.WEB_WORKER()) {
    }
    throw "not discovered";
  }

  static get RuntimeIs(): OnceRuntimeResolver {
    return {
      BROWSER: () =>
        typeof window !== "undefined" && typeof window.document !== "undefined",
      NODE_JS: () =>
        typeof process !== "undefined" &&
        process.versions != null &&
        process.versions.node != null &&
        global.NODE_JS !== undefined &&
        global.NODE_JS === true,
      NODE_LOADER: () =>
        typeof process !== "undefined" &&
        process.versions != null &&
        process.versions.node != null &&
        global.NODE_JS === undefined,
      SERVICE_WORKER: () =>
        typeof self === "object" &&
        self.constructor &&
        self.constructor.name === "ServiceWorkerGlobalScope",
      WEB_WORKER: () =>
        typeof self === "object" &&
        self.constructor &&
        self.constructor.name === "DedicatedWorkerGlobalScope",
    };
  }
}