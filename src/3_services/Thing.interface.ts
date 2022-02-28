import Class from "./Class.interface";
import ClassDescriptor from "./ClassDescriptor.interface";

export default interface Thing<ClassInterface> {
  id: string;
  init(...a: any[]): any;
  name: string;

  classDescriptor: ClassDescriptor
  destroy(): void;
  objectState: ThingObjectState
}

export enum ThingObjectState { 'ACTIVE' = 'active', 'DESTROYED' = 'destroyed' }
export interface ThingStatics<StaticClassInterface> extends Class<any> {
  classDescriptor: ClassDescriptor
}
