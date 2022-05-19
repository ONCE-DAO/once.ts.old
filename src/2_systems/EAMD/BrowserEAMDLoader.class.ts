import IOR from "../../3_services/IOR.interface";
import Loader, { loadingConfig } from "../../3_services/Loader.interface";
import { urlProtocol } from "../../3_services/Url.interface";
import BaseLoader from "../../1_infrastructure/BaseLoader.class";


class BrowserEAMDLoader extends BaseLoader implements Loader {

  removeObjectFromStore(object: any): void {
    throw new Error("Method not implemented.");
  }
  addObject2Store(ior: IOR, object: any): void {
    throw new Error("Method not implemented.");
  }

  async load(ior: IOR, config: loadingConfig): Promise<any> {
    // Shortcut for once itself

    if (this.canHandle(ior) !== 1 || !ior.namespace) throw new Error("Can not load this IOR");


    // HACK add / to be loaded from Server
    const result = await import('/' + ior.href);

    // HACK should be removed after Components exists
    if (ior.namespaceObject !== undefined) {
      if (!result[ior.namespaceObject]) throw new Error(`Missing Object '${ior.namespaceObject}' in the export from file: '${ior.href}'`)
      return result[ior.namespaceObject];
    } else {
      return result;
    }

  }

  canHandle(ior: IOR): number {
    return BrowserEAMDLoader.canHandle(ior);
  }


  static canHandle(ior: IOR): number {
    if (ior.protocol.includes(urlProtocol.esm) && ior.namespace !== undefined) {
      return 1;
    }
    return 0;
  }

}

export default BrowserEAMDLoader;