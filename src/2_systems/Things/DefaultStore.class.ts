import Store, { StoreEvents } from "../../3_services/Store.interface";
import BaseThing from "../../1_infrastructure/BaseThing.class";
import EventServiceInterface, { EventServiceConsumer } from "../../3_services/EventService.interface";
import DefaultEventService from "./DefaultEventService.class";
import EventService from "../../3_services/EventService.interface";


export default class DefaultStore extends BaseThing<DefaultStore> implements Store, EventServiceConsumer {
    EVENT_NAMES = StoreEvents;

    private registry: { [index: string]: any } = {};

    register(key: string, value: any): void {
        this.registry[key] = value;
    }
    remove(key: string): void {
        delete this.registry[key]
    }
    lookup(key: string) {
        return this.registry[key]
    }
    discover(): any[] {
        return Object.keys(this.registry).map(k => { return { key: k, value: this.registry[k] } });
    }
    clear(): void {
        this.registry = {};
    }

    get eventSupport(): EventService<StoreEvents> {
        if (this._eventSupport === undefined) {
            this._eventSupport = new DefaultEventService(this);
        }
        return this._eventSupport;
    }
}
