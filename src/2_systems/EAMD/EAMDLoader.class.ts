import IorInterface from "../../3_services/IOR.interface";
import Loader, { LoaderStatic, loadingConfig } from "../../3_services/Loader.interface";
import { urlProtocol } from "../../3_services/Url.interface";


export const EAMDLoader: LoaderStatic = class EAMDLoader implements Loader {

  load(ior: IorInterface, config: loadingConfig): Promise<any> {
    throw new Error("Method not implemented.");
  }

  canHandle(ior: IorInterface): number {
    return EAMDLoader.canHandle(ior);
  }

  static canHandle(ior: IorInterface): number {
    if (ior.protocol.includes(urlProtocol.esm)) {
      return 1;
    }
    return 0;
  }

}

export default EAMDLoader;