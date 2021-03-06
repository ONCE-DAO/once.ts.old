import IOR from "../../3_services/IOR.interface";
import Loader, { loaderReturnValue, LoaderStatic, loadingConfig } from "../../3_services/Loader.interface";
import { urlProtocol } from "../../3_services/Url.interface";
import BaseLoader from "../../1_infrastructure/BaseLoader.class";
import UcpComponentInterface from "../../3_services/UcpComponent.interface";


class EAMDLoader extends BaseLoader implements Loader {

  removeObjectFromStore(object: any): void {
    throw new Error("Method not implemented.");
  }
  addObject2Store(ior: IOR, object: any): void {
    throw new Error("Method not implemented.");
  }


  // get class(): typeof EAMDLoader {
  //   return EAMDLoader;
  // }

  async load(ior: IOR, config: loadingConfig): Promise<any> {
    // Shortcut for once itself

    if (this.canHandle(ior) !== 1 || !ior.namespace) throw new Error("Can not load this IOR");

    let modulePath: string;
    if (ior.namespace === 'tla.EAM.Once') {
      modulePath = "../../";
    } else if (ior.namespace === 'tla.EAM.once.ts') {
      modulePath = "../../";

    } else {

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

      modulePath = global.ONCE.eamd.eamdDirectory + '/' + submodules.devPath + "/../../dist/current/src/";
    }
    if (config?.returnValue === loaderReturnValue.path) {
      return modulePath;
    } else {
      const result = await import(modulePath);

      // HACK should be removed after Components exists
      if (ior.namespaceObject !== undefined) {
        if (!result[ior.namespaceObject]) throw new Error(`Missing Object '${ior.namespaceObject}' in the export from file: '${modulePath}'`)
        return result[ior.namespaceObject];
      } else {
        return result;
      }
    }
  }

  canHandle(ior: IOR): number {
    return EAMDLoader.canHandle(ior);
  }


  static canHandle(ior: IOR): number {
    if (ior.protocol.includes(urlProtocol.esm) && ior.namespace !== undefined) {
      return 1;
    }
    return 0;
  }

}

export default (EAMDLoader as LoaderStatic);