import { Environment } from "../../3_services/Enviroment.interface";
import { OnceMode, OnceState } from "../../3_services/Once.interface";
import { BaseOnce as Once } from "./BaseOnce.class";

export class OnceNodeImportLoader extends Once implements Environment {
  ENV = process.env;

  public mode = OnceMode.NODE_LOADER;
  protected state = OnceState.DISCOVER_SUCESS;
  private static instance: any;

  static get Instance() {
    if (!this.instance) {
      this.instance = new OnceNodeImportLoader(global);
    }
    return this.instance;
  }

  async start() {
    return this;
  }

  async getEAMD() {
    return undefined;
  }

  resolve(
    specifier: string,
    context: resolveContext,
    defaultResolve: Function
  ): Promise<{ url: string }> {
    if (global.ONCE === undefined) global.ONCE = OnceNodeImportLoader.Instance;
    // TODO hook it resolve/discover IOR
    return defaultResolve(specifier, context, defaultResolve);
  }

  load(
    url: string,
    context: loadContext,
    defaultLoad: Function
  ): {
    format: "builtin" | "commonjs" | "json" | "module" | "wasm";
    source: string | ArrayBuffer | Int8Array;
  } {
    // TODO hook it load via IOR
    return defaultLoad(url, context, defaultLoad);
  }
}

const load = OnceNodeImportLoader.Instance.load;
const resolve = OnceNodeImportLoader.Instance.resolve;
export { load, resolve };

type resolveContext = {
  conditions: string[];
  importAssertions: object;
  parentURL: string | undefined;
};

type loadContext = {
  format: string | null | undefined;
  importAssertions: any;
};
