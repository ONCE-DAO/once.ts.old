import { BasePersistanceManager } from "../../1_infrastructure/BasePersistanceManager.class"
import { OnceMode } from "../../3_services/Once.interface";
import IOR from "../../3_services/IOR.interface";
import { loadingConfig } from "../../3_services/Loader.interface";
import BaseLoader from "../../1_infrastructure/BaseLoader.class";
import { urlProtocol } from "../../3_services/Url.interface";
import DefaultIOR from "./DefaultIOR.class";
import UcpComponent from "../../3_services/UcpComponent.interface";
import WeakRefPromiseStore from "./WeakRefPromiseStore.class";
import ExtendedPromise from "../JSExtensions/Promise";

export default class UDELoader extends BaseLoader {
    private static _loaderInstance: any;

    private instanceStore: WeakRefPromiseStore = new WeakRefPromiseStore();

    static canHandle(ior: IOR): number {
        if (ONCE && ONCE.mode === OnceMode.NODE_JS) {
            if ((ior.hostName === 'localhost' || !ior.hostName) && ior.id && ior.protocol.includes(urlProtocol.ude)) {
                return 1;
            }
        }
        return 0;
    }

    canHandle(ior: IOR): number {
        return UDELoader.canHandle(ior);
    }

    clearStore(): void {
        this.instanceStore.clear();
    }

    removeObjectFromStore(object: IOR | UcpComponent<any, any>): void {
        if ("IOR" in object) {
            this.instanceStore.remove(object.IOR.href);
        } else {
            this.instanceStore.remove(object.href);
        }
    }

    addObject2Store(ior: IOR, object: UcpComponent<any, any> | Promise<any>): void {
        this.instanceStore.register(ior.href, object);
    }


    async load(ior: IOR, config?: loadingConfig): Promise<any> {

        // TODO change to unique Name
        let existingInstance = await this.instanceStore.lookup(ior.href);
        if (existingInstance) {
            return existingInstance;
        } else {

            let promiseHandler = ExtendedPromise.createPromiseHandler();
            this.instanceStore.register(ior.href, promiseHandler.promise);

            let persistanceManager = BasePersistanceManager.getPersistenceManager(ior);
            if (persistanceManager === undefined) throw new Error('No persistence manager found');
            let udeData = await persistanceManager.retrieve(ior);

            let aClass = await DefaultIOR.load(udeData.objectIor);
            let instance = new aClass() as UcpComponent<any, any>;

            instance.IOR = ior;

            instance.persistanceManager.retrieve();
            promiseHandler.setSuccess(instance);

            return instance;

        }
    }


    static factory(ior?: IOR): UDELoader {
        if (!this._loaderInstance) {
            this._loaderInstance = new this();
        }
        return this._loaderInstance;
    }

}

