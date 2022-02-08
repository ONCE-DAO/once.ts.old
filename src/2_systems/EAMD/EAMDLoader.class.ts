import IorInterface from "../../3_services/IOR.interface";
import Loader, { LoaderStatic, loadingConfig } from "../../3_services/Loader.interface";
import { urlProtocol } from "../../3_services/Url.interface";
import BaseLoader from "../../1_infrastructure/BaseLoader.class";


export const EAMDLoader: LoaderStatic = class EAMDLoader extends BaseLoader implements Loader {

  get class(): typeof EAMDLoader {
    return EAMDLoader;
  }

  async load(ior: IorInterface, config: loadingConfig): Promise<any> {
    // Shortcut for once itself

    if (this.canHandle(ior) !== 1 || !ior.namespace) throw new Error("Can not load this IOR");

    if (ior.namespace === 'tla.EAM.Once') {
      return await import("../../exports");
    }

    if (!global.ONCE) throw new Error("Missing ONCE");
    if (!global.ONCE.eamd) throw new Error("Missing EAMD in ONCE");

    let eamdRepos = await global.ONCE?.eamd?.discover() as Object;

    //@ts-ignore
    const repoPath = eamdRepos[ior.namespace];
    if (repoPath === undefined) {
      throw new Error("Missing Mapping from Namespace to Repository")
    }

    if (!global.ONCE.eamd.eamdRepository) throw new Error("Missing eamdRepository");

    let submodules = await global.ONCE.eamd.eamdRepository.getAndInstallSubmodule(ior, repoPath);


    return "../../../../../../../../../" + submodules.path + "/../../dist/current/src/exports.js";
  }

  canHandle(ior: IorInterface): number {
    return EAMDLoader.canHandle(ior);
  }


  static canHandle(ior: IorInterface): number {
    if (ior.protocol.includes(urlProtocol.esm) && ior.namespace !== undefined) {
      return 1;
    }
    return 0;
  }

}

export default EAMDLoader;