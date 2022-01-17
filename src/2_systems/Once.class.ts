// @ts-ignore
import { OnceExpress } from './../../../once.express@main/src/2_systems/OnceExpress'
import { Runtime } from './../unsorted/Runtime'
import { NodeLoader } from './../unsorted/NodeLoader'
import { Once as OnceInterface, OnceState } from '../3_services/Once.interface'
import { Scenario } from './Scenario'

let load, resolve

class Once implements OnceInterface {
  private creationDate: number
  private _scenario: Scenario

  private constructor (scenario?: Scenario) {
    this.creationDate = Date.now()
    this._scenario = scenario || new Scenario()
  }

  static start (scenario?: Scenario) {
    const once = new Once()
    once._scenario.state = once.discover()
    console.log('once started!')
    if (Runtime.isNode) {
      load = NodeLoader.load
      resolve = NodeLoader.resolve
      OnceExpress.start()
    }
  }

  discover () {
    return OnceState.Transient
  }
}

Once.start()

export { load, resolve, Once }
