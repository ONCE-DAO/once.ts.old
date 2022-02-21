import Store from "../../3_services/Store.interface";
import BaseThing from "../../1_infrastructure/BaseThing.class";
import EventServiceInterface from "../../3_services/EventService.interface";
import DefaultEventService from "./DefaultEventService.class";

export default class DefaultStore extends BaseThing<DefaultStore> implements Store {

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

    get eventSupport(): EventServiceInterface { return DefaultEventService.getSingleton() }

}
