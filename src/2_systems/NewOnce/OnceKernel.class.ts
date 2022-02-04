import Once, {
  OnceRuntimeResolver,
} from "../../3_services/NewOnce/Once.interface";

export abstract class OnceKernel {
  static async start(): Promise<Once> {
    const once: Once = await this.discover();
    return await once.start();
  }

  static async discover(): Promise<Once> {
    if (this.RuntimeIs.NODE_LOADER()) {
    }
    if (this.RuntimeIs.NODE_JS()) {
      return (
        await import("../NewOnce/OnceNodeServer.class.js")
      ).default.start();
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
        process.versions.node != null,
      NODE_LOADER: () => {
        if (global.NEWONCE === undefined) {
          // any import would be hooked and set global.ONCE to NodeImportLoaderOnceInstance
          // TODO implement again
          // await import("./OnceNodeImportLoader.js");
          if (global.NEWONCE !== undefined) return true;
        }
        return false;
      },
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
