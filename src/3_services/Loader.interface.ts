import IOR from "./IOR.interface";

export type loadingConfig = { usedByClass: any }

export interface Loader {

  load(ior: IOR, config: loadingConfig): Promise<any>
  canHandle(ior: IOR): number

}

export interface LoaderStatic {
  canHandle(ior: IOR): number
  factory(ior: IOR): Loader
}

export default Loader;