export class Runtime {
  static get isBrowser () {
    return (
      typeof window !== 'undefined' && typeof window.document !== 'undefined'
    )
  }

  static get isNode () {
    return (
      typeof process !== 'undefined' &&
          process.versions != null &&
          process.versions.node != null
    )
  }

  static get isWebWorker () {
    return (
      typeof self === 'object' &&
          self.constructor &&
          self.constructor.name === 'DedicatedWorkerGlobalScope'
    )
  }

  static get isServiceWorker () {
    return (
      typeof self === 'object' &&
          self.constructor &&
          self.constructor.name === 'ServiceWorkerGlobalScope'
    )
  }

  static isServiceWorkerSupported () {
    return navigator && 'serviceWorker' in navigator
  }
}
