import { Once as OnceInterface, OnceState } from '../3_services/Once.interface'

export class Once implements OnceInterface {
  private creationDate: number
  private constructor () {
    this.creationDate = Date.now()
  }

  static start () {
  }

  discover () {
    return OnceState.Transient
  }
}

Once.start()
