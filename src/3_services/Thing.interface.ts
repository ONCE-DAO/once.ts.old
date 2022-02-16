import Class from "./Class.interface";
import ClassDescriptor from "./ClassDescriptor.interface";

export default interface Thing<T> {
  id: string;
  init(...a: any[]): any;
  name: string;

  classDescriptor: ClassDescriptor
}

export interface ThingStatics extends Class<any> {
  classDescriptor: ClassDescriptor
}
