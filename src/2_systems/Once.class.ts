import {
  Once as OnceInterface,
  OnceInstallationMode,
  OnceMode,
  OnceState
} from '../3_services/Once.interface'
import { Server } from '../3_services/Server.interface'
import { IOR } from '../3_services/IOR.interface'
import { NodeLoader } from '../3_services/NodeLoader.interface'

abstract class Once implements OnceInterface {
  // #region startup
  static async start (): Promise<Once | undefined> {
    const once = await this.discoverOnce()

    once &&
      console.log(
        'once started',
        once.mode.toString(),
        once.state.toString()
      )
    return once
  }

  static async discoverOnce (): Promise<Once | undefined> {
    if (this.isNodeLoader) {
      global.ONCE = await DefaultNodeLoader.start()
    } else if (this.isNode) {
      const OnceExpress = (
        await import(
          // @ts-ignore
          './../../../once.nodeJs@main/src/2_systems/OnceExpress.js'
        )
      ).OnceExpress
      global.ONCE = await OnceExpress.start()
    } else if (this.isBrowser) {
      // this.mode = OnceMode.BROWSER;
      // this.state = OnceState.STARTED;
      // console.log("ONCE STARTED IN BROWSER");
      // window.ONCE = this;
      // document.body.textContent = "Once started"
    } else if (this.isServiceWorker) {
      throw new Error('not implemented')
    } else if (this.isWebWorker) {
      throw new Error('not implemented')
    }

    console.warn('ONCE not discovered, maybe ')
    return undefined
  }
  // #endregion

  server: Server[] = [];

  protected creationDate: number;
  protected onces: Once[] = [];
  protected mode: OnceMode = OnceMode.BOOTING;
  protected state: OnceState = OnceState.DISCOVER;
  protected installationMode: OnceInstallationMode =
    OnceInstallationMode.TRANSIENT;

  protected constructor () {
    this.onces.push(this)
    this.creationDate = Date.now()
  }

  discover (): Promise<IOR[]> {
    throw new Error('Method not implemented.')
  }

  get nodeLoader (): NodeLoader | undefined {
    const loader =
      this.mode === OnceMode.NODE_LOADER
        ? this
        : this.onces.find((o) => o.mode === OnceMode.NODE_LOADER)
    if (loader) return loader as unknown as NodeLoader
    return loader
  }

  // #region Runtime helper
  private static get isBrowser () {
    return (
      typeof window !== 'undefined' && typeof window.document !== 'undefined'
    )
  }

  private static get isNodeLoader () {
    return Once.isNodeRuntime && global.ONCE === undefined
  }

  private static get isNode () {
    return Once.isNodeRuntime && global.ONCE !== undefined
  }

  private static get isNodeRuntime () {
    return (
      typeof process !== 'undefined' &&
      process.versions != null &&
      process.versions.node != null
    )
  }

  private static get isWebWorker () {
    return (
      typeof self === 'object' &&
      self.constructor &&
      self.constructor.name === 'DedicatedWorkerGlobalScope'
    )
  }

  private static get isServiceWorker () {
    return (
      typeof self === 'object' &&
      self.constructor &&
      self.constructor.name === 'ServiceWorkerGlobalScope'
    )
  }

  private static isServiceWorkerSupported () {
    return navigator && 'serviceWorker' in navigator
  }
  // #endregion
}

class DefaultNodeLoader extends Once implements NodeLoader {
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

  static startSync (): Once {
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

const load = DefaultNodeLoader.loadHook
const resolve = DefaultNodeLoader.resolveHook

Once.start()

export { load, resolve, Once }
