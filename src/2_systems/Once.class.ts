import { NodeLoader } from './../unsorted/NodeLoader'
import { Once as OnceInterface, OnceInstallationMode, OnceMode } from '../3_services/Once.interface'
import { Scenario } from './Scenario'
import { Server } from '../3_services/Server.interface'
// import { NodeLoader } from '../unsorted/NodeLoader'

let load, resolve
declare global {
  // eslint-disable-next-line no-var
  var ONCE: Once | undefined
}

class Once implements OnceInterface {
  server: Server[] = []

  private creationDate: number

  private constructor () {
    this.creationDate = Date.now()
  }

  private onces: Once[] = []
  private installationMode: OnceInstallationMode = OnceInstallationMode.Transient
  private mode: OnceMode = OnceMode.Booting

  static async start () {
    const once = new Once()
    await once.discover()
    console.log('ONCE Started', once)
  }

  async discover () {
    if (Once.isNodeLoader) {
      const nodeLoader = NodeLoader.start(this)
      load = nodeLoader.load
      resolve = nodeLoader.resolve
    }

    if (Once.isNode) {
      if (global.ONCE) this.onces.push(global.ONCE)
      this.mode = OnceMode.NodeJs
      // @ts-ignore
      const OnceExpress = (await import('./../../../once.express@main/src/2_systems/OnceExpress.js')).OnceExpress
      OnceExpress.start()
    }
    this.onces.push(this)
    global.ONCE = this
    return []
  }

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
}

Once.start()

export { load, resolve, Once }
