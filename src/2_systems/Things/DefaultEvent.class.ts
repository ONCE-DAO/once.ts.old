import { OnceEvent } from "../../3_services/EventService.interface";
import BaseThing from "../../1_infrastructure/BaseThing.class";
import { Thing } from "../../exports";
import WeakRefPromiseStore from "./WeakRefPromiseStore.class";

export default class DefaultEvent extends BaseThing<DefaultEvent> implements OnceEvent {

    get class(): typeof DefaultEvent {
        return DefaultEvent;
    }

    private readonly _store = new WeakRefPromiseStore();
    addCallback(callbackFunction: Function, targetObject: Thing<any>): void {
        this._store.register(targetObject, callbackFunction);
    }
    async fire(eventSource: Thing<any>, ...args: any[]) {
        let result = this.getCallbackFunctions().map(eventTarget => {
            return eventTarget.value(this, eventSource, ...args) as Promise<any>;
        });
        return Promise.all(result);
    }

    getCallbackFunctions() {
        return this._store.discover();
    }


}