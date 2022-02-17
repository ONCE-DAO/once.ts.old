import Class from "./Class.interface";
import IOR from "./IOR.interface";

export enum loaderReturnValue { "default", "path" }

export type loadingConfig = { usedByClass?: Class<any>, returnValue?: loaderReturnValue } | undefined;

export interface Loader {

  load(ior: IOR, config: loadingConfig): Promise<any>
  canHandle(ior: IOR): number

}

export interface LoaderStatic {
  canHandle(ior: IOR): number
  factory(ior: IOR): Loader
}

export default Loader;