import { NodeLoader } from "../3_services/NodeLoader.interface"
import { OnceMode, OnceState } from "../3_services/Once.interface"
import { AbstractOnce } from "./AbstractOnce.class"

export class DefaultNodeLoader extends AbstractOnce implements NodeLoader {
    private static async getNodeLoader (): Promise<NodeLoader | undefined> {
      if (!global.ONCE) {
        global.ONCE = DefaultNodeLoader.startSync()
      }
      return global.ONCE.nodeLoader
    }
  
    static async resolveHook (specifier: any, context: any, defaultResolve: any) {
      const loader = await DefaultNodeLoader.getNodeLoader()
      if (loader && loader.resolve) {
        return loader.resolve(specifier, context, defaultResolve)
      }
      return defaultResolve(specifier, context, defaultResolve)
    }
  
    static async loadHook (url: string, context: any, defaultLoad: any) {
      const loader = await DefaultNodeLoader.getNodeLoader()
      if (loader && loader.load) return loader.load(url, context, defaultLoad)
      return defaultLoad(url, context, defaultLoad)
    }
  
    static async start () {
      return this.startSync()
    }
  
    static startSync (): AbstractOnce {
      const once = new DefaultNodeLoader()
      once.state = OnceState.STARTED
      global.ONCE = once
      return once
    }
  
    constructor () {
      super()
      global.ONCE && this.onces.push(global.ONCE)
      this.mode = OnceMode.NODE_LOADER
    }
  
    // #region experimental-loader
    resolve (
      specifier: string,
      context: {
        conditions: string[];
        importAssertions: object;
        parentURL: string | undefined;
      },
      defaultResolve: Function
    ): Promise<{ url: string }> {
      // TODO hook it
      return defaultResolve(specifier, context, defaultResolve)
    }
  
    load (
      url: string,
      context: {
        format: string | null | undefined;
        importAssertions: any; // import { NodeLoader } from "../unsorted/NodeLoader";
      },
      defaultLoad: Function
    ): {
      format: 'builtin' | 'commonjs' | 'json' | 'module' | 'wasm';
      source: string | ArrayBuffer | Int8Array;
    } {
      // TODO hook it
      return defaultLoad(url, context, defaultLoad)
    }
  }
  