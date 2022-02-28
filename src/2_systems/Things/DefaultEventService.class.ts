import EventService, { OnceEvent } from "../../3_services/EventService.interface";
import BaseThing from "../../1_infrastructure/BaseThing.class";
import WeakRefPromiseStore from "./WeakRefPromiseStore.class";
import DefaultEvent from "./DefaultEvent.class";
import Thing from "../../3_services/Thing.interface";
import Store from "../../3_services/Store.interface";

export default class DefaultEventService<EventEnum> extends BaseThing<DefaultEventService<EventEnum>> implements EventService<EventEnum> {

    private static __store: Store;
    private _consumerThing: Thing<any>;

    private static get _store() {
        if (this.__store === undefined) {
            this.__store = new WeakRefPromiseStore();
        }
        return this.__store;
    }

    constructor(consumerThing: Thing<any>) {
        super();
        this._consumerThing = consumerThing;
    }

    addEventListener(eventName: EventEnum, callbackFunction: Function, eventTarget: Thing<any>): void {
        let sourceEvents = this.getEvents();
        if (!sourceEvents) {
            sourceEvents = {};
            DefaultEventService._store.register(this._consumerThing, sourceEvents);
        }
        if (typeof eventName !== 'string' && typeof eventName !== 'number') {
            throw new Error('eventName is not a string or number');
        }
        let event = sourceEvents[eventName];
        if (!event) {
            sourceEvents[eventName] = event = new DefaultEvent().init(this._consumerThing, eventName)
        }


        event.addCallback(callbackFunction, eventTarget);
    }

    removeEventListener(eventTargetObject: Thing<any>, eventName?: EventEnum): void {
        throw new Error("Method not implemented.");
    }

    getEvents(): { [index: string]: OnceEvent } {
        return DefaultEventService._store.lookup(this._consumerThing)
    }

    async fire(eventName: EventEnum, ...args: any[]) {

        const sourceEvents = this.getEvents();
        if (!sourceEvents) return [];

        if (typeof eventName !== 'string' && typeof eventName !== 'number') {
            throw new Error('eventName is not a string or number');
        }
        const event = sourceEvents[eventName];
        if (event) {
            return await event.fire(this._consumerThing, ...args);
        }
        return [];
    }

}
