import Thing from "./Thing.interface";

export default interface EventService extends Thing<EventService> {
    addEventListener(eventSourceObject: Thing<any>, eventName: string, callbackFunction: Function, eventTargetObject: Thing<any>): void;
    removeEventListener(eventTargetObject: Thing<any>, eventSourceObject?: Thing<any>, eventName?: string): void;
    getEvents(eventSourceObject: Thing<any>): { [index: string]: OnceEvent };
    fire(eventName: string, eventSource: Thing<any>, ...args: any[]): Promise<any[]>;
}

export interface OnceEvent {
    fire(eventSource: Thing<any>, ...args: any[]): Promise<any[]>

    addCallback(callbackFunction: Function, targetObject: Thing<any>): void;
}