import IorInterface from "./IOR.interface";

export type loadingConfig = { usedByClass: any }

export interface Loader {

  load(ior: IorInterface, config: loadingConfig): Promise<any>
  canHandle(ior: IorInterface): number

}

export interface LoaderStatic {
  canHandle(ior: IorInterface): number
  factory(ior: IorInterface): Loader
}

export default Loader;