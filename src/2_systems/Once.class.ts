import { NodeLoader } from './../unsorted/NodeLoader'
import { Once as OnceInterface, OnceInstallationMode, OnceMode } from '../3_services/Once.interface'
import { Scenario } from './Scenario'
import { Server } from '../3_services/Server.interface'
import { Runtime } from '../unsorted/Runtime'
// import { NodeLoader } from '../unsorted/NodeLoader'

let load, resolve
declare global {
  var ONCE: Once | undefined
}

class Once implements OnceInterface {
  private creationDate: number
  private _scenario: Scenario

  private constructor (scenario?: Scenario) {
    this.creationDate = Date.now()
    this._scenario = scenario || new Scenario()
  }

  private onces: Once[] = []
  id: string | undefined
  name: string | undefined
  installationMode: OnceInstallationMode = OnceInstallationMode.Transient
  mode: OnceMode = OnceMode.Booting

  server: Server[] = []

  static async start (scenario?: Scenario) {
    const once = new Once()

    if (Runtime.isNodeLoader) {
      const nodeLoader = NodeLoader.start(once)
      load = nodeLoader.load
      resolve = nodeLoader.resolve
    }

    if (Runtime.isNode) {
      if (global.ONCE) once.onces.push(global.ONCE)
      once.mode = OnceMode.NodeJs
      // @ts-ignore
      const OnceExpress = (await import('./../../../once.express@main/src/2_systems/OnceExpress.js')).OnceExpress
      OnceExpress.start()
    }

    once.onces.push(once)
    global.ONCE = once
    console.log('ONCE', once)
  }

  discover () {
    return []
  }
}

Once.start()

export { load, resolve, Once }
