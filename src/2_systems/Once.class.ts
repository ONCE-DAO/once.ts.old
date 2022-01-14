import { Once, OnceState } from '../3_services/Once.interface'

export class OnceInstance implements Once {
  discover () {
    return OnceState.Transient
  }
}
