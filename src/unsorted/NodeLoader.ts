import { Once } from '../2_systems/Once.class'
import { OnceMode, OnceState } from '../3_services/Once.interface'

export class NodeLoader extends Once {
  private static singleton: NodeLoader

  private constructor () {
    super()
    this.mode = OnceMode.NODE_LOADER;
  }

  static async start () {
    console.log("NODELOADER start")
    this.singleton = new NodeLoader()
    this.singleton.state = OnceState.STARTED
    return NodeLoader.singleton
  }

  init () {
    // Load all loader implementation
  }

  resolve (specifier: any, context: any, defaultResolve: any) {
    console.log('NodeLoader: resolve', specifier)

    // loop all loader
    //    foreach

    // if (NodeLoader.singleton === undefined) {
    //   NodeLoader.singleton.init()
    // }

    // console.log('import called with specifier: ', specifier)
    const {
      parentURL = null
    } = context

    // Normally Node.js would error on specifiers starting with 'https://', so
    // this hook intercepts them and converts them into absolute URLs to be
    // passed along to the later hooks below.
    // if (specifier.startsWith('https://')) {
    // if (specifier.startsWith('ior://')) {
    //   specifier = specifier.substring(6, specifier.length)
    // }
    if (specifier.startsWith('ior:')) {
      return {
        url: specifier
      }
    } else if (parentURL && parentURL.startsWith('ior:')) {
      return {
        url: new URL(specifier, parentURL).href
      }
    }

    // Let Node.js handle all other specifiers.
    return defaultResolve(specifier, context, defaultResolve)
  }

  load (url: string, context: any, defaultLoad: any) {
    console.log('NodeLoader: load')

    // if (url.startsWith('ior:')) {
    //   return await IOR.load(url)
    // }
    // Let Node.js handle all other URLs.
    return defaultLoad(url, context, defaultLoad)
  }

  // For JavaScript to be loaded over the network, we need to fetch and
// return it.
// if (url.startsWith('https://')) {
//   return new Promise((resolve, reject) => {
//     get(url, (res) => {
//       let data = ''
//       res.on('data', (chunk: any) => data += chunk)
//       res.on('end', () => resolve({
//         // This example assumes all network-provided JavaScript is ES module
//         // code.
//         format: 'module',
//         source: data
//       }))
//     }).on('error', (err) => reject(err))
//   })
// }
}
