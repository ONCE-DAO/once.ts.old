import IOR from "../../3_services/IOR.interface";
import Loader, { LoaderStatic, loadingConfig } from "../../3_services/Loader.interface";
import { urlProtocol } from "../../3_services/Url.interface";

import EAMDLoader from "./EAMDLoader.class";

// REFACTOR prevents inheritance (extension) ....see solution in EAMDLoader...think about better alternatives
export const EAMDGithubLoader: LoaderStatic = 
  class EAMDGithubLoader 
    extends EAMDLoader 
    implements Loader {

  get class(): typeof EAMDLoader {
    return EAMDLoader;
  }

  async load(ior: IOR, config: loadingConfig): Promise<any> {
    // Shortcut for once itself

    if (this.canHandle(ior) !== 1 || !ior.namespace) throw new Error("Can not load this IOR");

    if (ior.namespace === 'tla.EAM.Once') {
      return await import("../../exports");
    }

    if (!global.ONCE) throw new Error("Missing ONCE");
    if (!global.ONCE.eamd) throw new Error("Missing EAMD in ONCE");

    //let eamdRepos = await global.ONCE?.eamd?.discover() as Object;

    console.log("loading  "+ior.pathName+ "from GitHub: "+ior.hash)

    //@ts-ignore
    const repoPath = ior.hash;
    if (repoPath === undefined) {
      throw new Error("Missing Mapping from Namespace to Repository in BaseEAMD discover")
    }

    if (!global.ONCE.eamd.eamdRepository) throw new Error("Missing eamdRepository");

    let submodules = await global.ONCE.eamd.eamdRepository.getAndInstallSubmodule(ior, repoPath);


    return global.ONCE.eamd.eamdRepository.folderPath +"/"+ submodules.path + "/../../dist/current/src/exports.js";
  }

  canHandle(ior: IOR): number {
    return EAMDLoader.canHandle(ior);
  }


  static canHandle(ior: IOR): number {
    if (ior.protocol.includes(urlProtocol.github) 
    //&& ior.namespace !== undefined
    && ior.pathName !== undefined
    && ior.hash !== undefined
    ) {
      return 1;
    }
    return 0;
  }

}

export default EAMDGithubLoader;