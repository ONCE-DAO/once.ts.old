import IorInterface from "./IOR.interface";

export type loadingConfig = { usedByClass: any }

export interface Loader {

  load(ior: IorInterface, config: loadingConfig): Promise<any>
}

export default Loader;