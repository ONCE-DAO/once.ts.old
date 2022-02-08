import IOR from "../../3_services/IOR.interface";
import Loader, { LoaderStatic, loadingConfig } from "../../3_services/Loader.interface";
import { urlProtocol } from "../../3_services/Url.interface";
import BaseLoader from "../../1_infrastructure/BaseLoader.class";


export const EAMDLoader: LoaderStatic = class EAMDLoader extends BaseLoader implements Loader {

  get typeDescriptor(): typeof EAMDLoader {
    return EAMDLoader;
  }

  async load(ior: IOR, config: loadingConfig): Promise<any> {
    // Shortcut for once itself
    if (ior.namespace === 'tla.EAM.Once') {
      return await import("../../exports");
    }
    throw new Error("Not implemented yet");

  }

  canHandle(ior: IOR): number {
    return EAMDLoader.canHandle(ior);
  }


  static canHandle(ior: IOR): number {
    if (ior.protocol.includes(urlProtocol.esm) && ior.namespace) {
      return 1;
    }
    return 0;
  }

}

export default EAMDLoader;