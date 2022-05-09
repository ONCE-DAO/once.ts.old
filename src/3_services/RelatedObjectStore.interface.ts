import ClassDescriptor, { InterfaceDescriptor } from "../2_systems/Things/DefaultClassDescriptor.class";
import Store from "./Store.interface";
import Thing, { ThingStatics } from "./Thing.interface";

export type RelatedObjectStoreStoredObject = { classDescriptor: ClassDescriptor };


export default interface RelatedObjectStore extends Store {

    register(aObject: RelatedObjectStoreStoredObject): any

    remove(aObject: RelatedObjectStoreStoredObject, anInterface?: InterfaceDescriptor): void;

    lookup(anInterface: InterfaceDescriptor): any[];

    discover(): Map<InterfaceDescriptor, any[]>;
}