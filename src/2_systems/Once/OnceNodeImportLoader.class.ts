import Once, { OnceMode, OnceState } from "../../3_services/Once.interface";

import EAMDInterface from "../../3_services/EAMD.interface";
import DefaultThing from "../Things/DefaultThing.class";

export default class OnceNodeImportLoader extends DefaultThing<Once> implements Once {
  creationDate: Date;
  ENV = process.env;
  eamd: EAMDInterface | undefined;

  public mode = OnceMode.NODE_LOADER;
  state = OnceState.DISCOVER_SUCCESS;
  private static instance: any;

  constructor() {
    super();
    this.creationDate = new Date();
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new OnceNodeImportLoader();
    }
    return this.instance;
  }

  async start(): Promise<OnceNodeImportLoader> {
    console.log("ONCE STARTED AS NODE_LOADER");
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
    if (global.ONCE === undefined)
      global.ONCE = OnceNodeImportLoader.getInstance();
    // TODO hook it resolve/discover IOR
    if (specifier.startsWith("ior:")) {
      // Once Unit shortcut
      if (specifier.startsWith("ior:esm:git:tla.EAM.Once")) {
        return defaultResolve("../exports.js", context, defaultResolve);
      } else {
        // @ts-ignore
        //IOR.getInstance().init(specifier);
      }
      specifier;
    }

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
    // console.log(`Import: ${url}`);
    return defaultLoad(url, context, defaultLoad);
  }

  /**
 * This example has the application context send a message to the loader
 * and sends the message back to the application context
 * @param {{
     port: MessagePort,
   }} utilities Things that preload code might find useful
 * @returns {string} Code to run before application startup
 */
  globalPreload() {
    global.NODE_JS = true;
  }
}

const load = OnceNodeImportLoader.getInstance().load;
const resolve = OnceNodeImportLoader.getInstance().resolve;
const globalPreload = OnceNodeImportLoader.getInstance().globalPreload;
export { load, resolve, globalPreload };

type resolveContext = {
  conditions: string[];
  importAssertions: object;
  parentURL: string | undefined;
};

type loadContext = {
  format: string | null | undefined;
  importAssertions: any;
};
