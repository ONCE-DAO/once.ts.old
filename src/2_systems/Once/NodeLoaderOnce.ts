import { Environment } from "../../3_services/Enviroment.interface";
import { OnceMode, OnceState } from "../../3_services/Once.interface";
import { BaseOnce } from "./BaseOnce.class";

export class NodeLoaderOnce extends BaseOnce implements Environment {
  ENV = process.env;
  public mode = OnceMode.NODE_LOADER;
  protected state = OnceState.DISCOVER_SUCESS;
  private static instance: any;

  static get Instance() {
    if (!this.instance) {
      this.instance = new NodeLoaderOnce(global);
    }
    return this.instance;
  }

  startAsync = async () => this;
  installRepository = async () => undefined;
  foo() {
    let f = {
      conditions: [],
      importAssertions: {},
      parentURL: "",
    };
    this.resolve("", f, () => {});
  }
  resolve(
    specifier: string,
    context: resolveContext,
    defaultResolve: Function
  ): Promise<{ url: string }> {
    if (global.ONCE === undefined) global.ONCE = NodeLoaderOnce.Instance;
    // TODO hook it
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
    // TODO hook it
    return defaultLoad(url, context, defaultLoad);
  }
}

const load = NodeLoaderOnce.Instance.load;
const resolve = NodeLoaderOnce.Instance.resolve;
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
