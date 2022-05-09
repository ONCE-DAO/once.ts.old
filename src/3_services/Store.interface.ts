import EventService, { EventServiceConsumer } from "./EventService.interface";

export default interface Store extends EventServiceConsumer {

    register(key: any, value: any): any

    remove(key: any): void;

    lookup(key: any): any;

    discover(): any;

    clear(): void
}

export enum StoreEvents {
    ON_REGISTER = "ON_REGISTER",
    ON_REMOVE = "ON_REMOVE",
    ON_CLEAR = "ON_CLEAR"
}