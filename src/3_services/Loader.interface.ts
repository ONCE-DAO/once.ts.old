import { InterfaceDescriptor } from "../2_systems/Things/DefaultClassDescriptor.class";
import Class from "./Class.interface";
import IOR from "./IOR.interface";
import { ThingStatics } from "./Thing.interface";

export enum loaderReturnValue { "default", "path" }

export type loadingConfig = { usedByClass?: Class<any>, returnValue?: loaderReturnValue } | undefined;

// Namespace Package und Version könnten noch über den Filenamen discovered werden
export const LoaderID = InterfaceDescriptor.register("tla.EAM", "once.ts", "0.0.1", "Loader")

export interface Loader {

  load(ior: IOR, config?: loadingConfig): Promise<any>
  canHandle(ior: IOR): number
  removeObjectFromStore(object: IOR | any): void
  addObject2Store(ior: IOR, object: any | Promise<any>): void;
}
export interface LoaderStatic extends ThingStatics<LoaderStatic> {
  canHandle(ior: IOR): number
  factory(ior: IOR): Loader
  new(...args: any[]): Loader;
}

export default Loader;