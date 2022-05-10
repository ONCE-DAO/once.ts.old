import BaseThing from "../../1_infrastructure/BaseThing.class";
import EventService from "../../3_services/EventService.interface";
import { EventServiceConsumer } from "../../3_services/EventService.interface";
import RelatedObjectStoreInterface, { RelatedObjectStoreStoredObject } from "../../3_services/RelatedObjectStore.interface";
import Store, { StoreEvents } from "../../3_services/Store.interface";
import { InterfaceDescriptor } from "./DefaultClassDescriptor.class";
import DefaultEventService from "./DefaultEventService.class";

export default class RelatedObjectStore extends BaseThing<RelatedObjectStore> implements Store, EventServiceConsumer, RelatedObjectStoreInterface {

    EVENT_NAMES = StoreEvents;

    private registry!: Map<InterfaceDescriptor, RelatedObjectStoreStoredObject[]>;

    constructor() {
        super();
        this.clear();
    }

    clear(): void {
        this.registry = new Map<InterfaceDescriptor, RelatedObjectStoreStoredObject[]>();
    }

    register(aObject: RelatedObjectStoreStoredObject): void {

        let interfaces = aObject.classDescriptor.implementedInterfaces;

        for (const anInterface of interfaces) {
            let exists = this.registry.get(anInterface);
            if (exists) {
                exists.push(aObject);
            } else {
                this.registry.set(anInterface, [aObject]);
            }
        }
    }

    remove(aObject: RelatedObjectStoreStoredObject, anInterface?: InterfaceDescriptor): void {
        let interfaces = anInterface ? [anInterface] : aObject.classDescriptor.implementedInterfaces;

        for (const interfaceItem of interfaces) {
            let exists = this.registry.get(interfaceItem);
            if (exists) {
                const newArray = exists.filter(x => x !== aObject);
                if (exists.length !== newArray.length) {
                    this.registry.set(interfaceItem, newArray);
                }
            }
        }

    }

    lookup(anInterface: InterfaceDescriptor): RelatedObjectStoreStoredObject[] {
        return this.registry.get(anInterface) || [];
    }

    discover(): Map<InterfaceDescriptor, RelatedObjectStoreStoredObject[]> {
        return this.registry;
    }

    get eventSupport(): EventService<StoreEvents> {
        if (this._eventSupport === undefined) {
            this._eventSupport = new DefaultEventService(this);
        }
        return this._eventSupport;
    }

}
