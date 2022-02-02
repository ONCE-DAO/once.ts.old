import { Environment } from "../../3_services/Enviroment.interface";
import { Once, OnceMode, OnceState } from "../../3_services/Once.interface";
import { OnceKernel } from "./OnceKernel.class";

export class OnceNodeImportLoader extends OnceKernel implements Environment {

  ENV = process.env;

  public mode = OnceMode.NODE_LOADER;
  state = OnceState.DISCOVER_SUCESS;
  private static instance: any;

  static get Instance() {
    if (!this.instance) {
      this.instance = new OnceNodeImportLoader(global);
    }
    return this.instance;
  }

  start(): Promise<Once> {
    throw new Error("Method not implemented.");
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
