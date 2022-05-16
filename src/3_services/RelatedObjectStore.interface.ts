import ClassDescriptor, { InterfaceDescriptorInterface } from "../2_systems/Things/DefaultClassDescriptor.class";
import Store from "./Store.interface";

export type RelatedObjectStoreStoredObject = { classDescriptor: ClassDescriptor };


export default interface RelatedObjectStore extends Store {

    register(aObject: RelatedObjectStoreStoredObject): any

    remove(aObject: RelatedObjectStoreStoredObject, anInterface?: InterfaceDescriptorInterface): void;

    lookup(anInterface: InterfaceDescriptorInterface): any[];

    discover(): Map<InterfaceDescriptorInterface, any[]>;
}