import EventService, { OnceEvent } from "../../3_services/EventService.interface";
import BaseThing from "../../1_infrastructure/BaseThing.class";
import { Thing } from "../../exports";
import WeakRefPromiseStore from "./WeakRefPromiseStore.class";
import DefaultEvent from "./DefaultEvent.class";

export default class DefaultEventService extends BaseThing<DefaultEventService> implements EventService {

    get typeDescriptor(): typeof DefaultEventService {
        return DefaultEventService;
    }

    private _store = new WeakRefPromiseStore();
    addEventListener(eventSourceObject: Thing<any>, eventName: string, callbackFunction: Function, eventTarget: Thing<any>): void {
        let sourceEvents = this.getEvents(eventSourceObject);
        if (!sourceEvents) {
            sourceEvents = {};
            this._store.register(eventSourceObject, sourceEvents);
        }

        let event = sourceEvents[eventName];
        if (!event) {
            sourceEvents[eventName] = event = new DefaultEvent().init(eventSourceObject, eventName)
        }

        event.addCallback(callbackFunction, eventTarget);
    }

    removeEventListener(eventTargetObject: Thing<any>, eventSourceObject?: Thing<any>, eventName?: string): void {
        throw new Error("Method not implemented.");
    }

    getEvents(eventSourceObject: Thing<any>): { [index: string]: OnceEvent } {
        return this._store.lookup(eventSourceObject)
    }

    async fire(eventName: string, eventSource: Thing<any>, ...args: any[]) {

        const sourceEvents = this.getEvents(eventSource);
        if (!sourceEvents) return [];


        const event = sourceEvents[eventName];
        if (event) {
            return await event.fire(eventSource, ...args);
        }
        return [];
    }


}