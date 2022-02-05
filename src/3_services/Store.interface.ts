import EventService from "./EventService.interface";

export default interface Store {

    register(key: any, value: any): any

    remove(key: any): void

    lookup(key: any): any

    discover(): any[]

    clear(): void

    //TODO@BE Remove undefined later on
    eventSupport: EventService | undefined
}

export enum StoreEvents {
    ON_REGISTER,
    ON_REMOVE,
    ON_CLEAR
}