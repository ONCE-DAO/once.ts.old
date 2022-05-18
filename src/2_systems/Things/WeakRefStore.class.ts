import EventService from "../../3_services/EventService.interface";
import Store, { StoreEvents } from "../../3_services/Store.interface";
import BaseThing from "../../1_infrastructure/BaseThing.class";
import ExtendedPromise from "../JSExtensions/Promise.class";
import DefaultEventService from "./DefaultEventService.class";

type storedObject = { ref?: any };

export default class WeakRefStore extends BaseThing<WeakRefStore> implements Store {
    EVENT_NAMES = StoreEvents;

    get eventSupport(): EventService<StoreEvents> {
        if (this._eventSupport === undefined) {
            this._eventSupport = new DefaultEventService(this);
        }
        return this._eventSupport;
    }
    discover(): any[] {
        let result = [];
        for (const [key, objectRef] of Object.entries(this.registry)) {
            if (objectRef === undefined) continue;

            const object = (this.weakRefAvailable ? objectRef.ref.deref() : objectRef.ref);
            if (object) {
                // TODO@BE Update wen UcpComponents
                // if (Thinglish.isInstanceOf(object, UcpComponent)) {
                //     // @ToDo need cleanup
                //     continue;
                // }
                result.push({ key, value: object });
            }


        }
        for (const [key, objectRef] of this.mapRegistry) {
            if (objectRef === undefined) continue;

            const object = (this.weakRefAvailable ? objectRef.ref.deref() : objectRef.ref);
            if (object) {
                result.push({ key, value: object });
            }


        }

        return result;
    }
    private registry: { [index: string]: storedObject } = {};
    private mapRegistry: Map<any, storedObject> = new Map();
    private _weakRefActive: boolean = true;

    private get weakRefAvailable() {
        if (this._weakRefActive === false) return false;
        return typeof WeakRef !== 'undefined';
    }

    init(config?: { weakRefActive: boolean }) {
        super.init();
        if (config?.weakRefActive !== undefined) {
            this._weakRefActive = config.weakRefActive;
        }
        return this;
    }

    clear() {
        this.mapRegistry = new Map();
        this.registry = {}
    }

    register(key: any, value: any) {

        let objectRef: storedObject;
        const isPromise = ExtendedPromise.isPromise(value);
        if (isPromise) {
            throw new Error("Can not store a Promise")
        } else {
            objectRef = { ref: (this.weakRefAvailable ? new WeakRef(value) : value) }
        }

        if (typeof key === 'object') {
            this.mapRegistry.set(key, objectRef);
        } else {
            this.registry[key] = objectRef;
        }

    }

    lookup(key: any): any {
        let objectRef;
        if (typeof key === 'object') {
            objectRef = this.mapRegistry.get(key);
        } else {
            objectRef = this.registry[key];
        }

        if (objectRef === undefined) return undefined;

        let object = (this.weakRefAvailable ? objectRef.ref.deref() : objectRef.ref);
        return object;
    }

    remove(key: any, config?: { silent: boolean }) {
        const value = !(config && config.silent === true) ? this.lookup(key) : '';
        if (typeof key === 'object') {
            this.mapRegistry.delete(key);
        } else {
            delete this.registry[key];
        }

    }

}



