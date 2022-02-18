import EventServiceInterface from "../../3_services/EventService.interface";
import Store from "../../3_services/Store.interface";
import BaseThing from "../../1_infrastructure/BaseThing.class";
import ExtendedPromise from "../JSExtensions/Promise";

type storedObject = { ref?: any, promise?: any };

export default class WeakRefPromiseStore extends BaseThing<WeakRefPromiseStore> implements Store {

    discover(): any[] {
        let result = [];
        for (const [key, objectRef] of Object.entries(this.registry)) {
            if (objectRef === undefined) continue;
            if (typeof objectRef.promise !== 'undefined') {
                result.push(objectRef.promise);
            } else {
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

        }
        for (const [key, objectRef] of this.mapRegistry) {
            if (objectRef === undefined) continue;
            if (typeof objectRef.promise !== 'undefined') {
                result.push(objectRef.promise);
            } else {
                const object = (this.weakRefAvailable ? objectRef.ref.deref() : objectRef.ref);
                if (object) {
                    result.push({ key, value: object });
                }
            }

        }

        return result;
    }
    eventSupport: EventServiceInterface | undefined;
    private registry: { [index: string]: storedObject } = {};
    private mapRegistry: Map<any, storedObject> = new Map();
    private eventService: EventServiceInterface | undefined;
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
            objectRef = { promise: value };
        } else {
            objectRef = { ref: (this.weakRefAvailable ? new WeakRef(value) : value) }
        }

        if (typeof key === 'object') {
            this.mapRegistry.set(key, objectRef);
        } else {
            this.registry[key] = objectRef;
        }

        if (isPromise) {
            value.then((x: any) => {
                if (x === undefined) {
                    this.remove(key);
                } else {
                    objectRef.ref = (this.weakRefAvailable ? new WeakRef(x) : x);
                    delete objectRef.promise;
                }
            })
        }

    }

    lookup(key: any) {
        let objectRef;
        if (typeof key === 'object') {
            objectRef = this.mapRegistry.get(key);
        } else {
            objectRef = this.registry[key];
        }

        if (objectRef === undefined) return undefined;

        if (typeof objectRef.promise !== 'undefined') {
            return objectRef.promise;
        }
        let object = (this.weakRefAvailable ? objectRef.ref.deref() : objectRef.ref);
        // TODO@BE Update wenn ucp Components vorhanden
        // if (Thinglish.isInstanceOf(object, UcpComponent)) {
        //     if (object.componentState === UcpComponent.COMPONENT_STATES.DESTROYED) {
        //         this.remove(key, { silent: true });
        //         return undefined;
        //     }
        // }
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



