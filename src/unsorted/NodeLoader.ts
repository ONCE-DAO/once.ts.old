export class NodeLoader {
  static resolve (specifier: any, context: any, defaultResolve: any) {
    console.log('import called with specifier: ', specifier)
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

  static load (url: string, context: any, defaultLoad: any) {
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
