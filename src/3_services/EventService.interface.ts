import Thing, { ThingStatics } from "./Thing.interface";

export default interface EventService<EventEnum> extends Thing<EventService<any>> {
    addEventListener(eventName: EventEnum, callbackFunction: Function, eventTargetObject: Thing<any>): void;
    removeEventListener(eventTargetObject: Thing<any>, eventName?: EventEnum): void;
    getEvents(): { [index: string]: OnceEvent };
    fire(eventName: EventEnum, ...args: any[]): Promise<any[]>;
}

export interface OnceEvent {
    fire(eventSource: Thing<any>, ...args: any[]): Promise<any[]>

    addCallback(callbackFunction: Function, targetObject: Thing<any>): void;
}

export interface EventServiceConsumer<EventEnum, TypeEventEnum> {
    eventSupport: EventService<EventEnum>;
    EVENT_NAMES: TypeEventEnum;
}

export interface EventServiceStatics extends ThingStatics<EventServiceStatics> {
    constructor(eventSourceObject: Thing<any>): EventService<any>
}