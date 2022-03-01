export default interface ClassDescriptor {
  extends: any[];
  class: any;
  addInterfaces(interfaceList: string[]): this;

  implements: InterfaceDescriptor[];
  add(object: any): this

}


export interface InterfaceDescriptor {
  name: string;
  implementations: ClassDescriptor[];
  extends: InterfaceDescriptor[];
  addImplementation(classDescriptor: ClassDescriptor): InterfaceDescriptor;
  addExtension(listOfInterfaces: string[]): InterfaceDescriptor;
  add(object: any): this
  allExtendedInterfaces: InterfaceDescriptor[];
}