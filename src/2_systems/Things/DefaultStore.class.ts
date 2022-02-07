import EventServiceInterface from "../../3_services/EventService.interface";
import Store from "../../3_services/Store.interface";
import BaseThing from "../../1_infrastructure/BaseThing.class";

export default class DefaultStore extends BaseThing<DefaultStore> implements Store {

    get class(): typeof DefaultStore {
        return DefaultStore;
    }

    eventSupport: EventServiceInterface | undefined;
    private registry: { [index: string]: any } = {};
    private eventService: EventServiceInterface | undefined;

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


}
