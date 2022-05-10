import { BasePersistanceManager } from "../../1_infrastructure/BasePersistanceManager.class"
import { OnceMode } from "../../3_services/Once.interface";
import IOR from "../../3_services/IOR.interface";
import { loadingConfig } from "../../3_services/Loader.interface";
import BaseLoader from "../../1_infrastructure/BaseLoader.class";
import { urlProtocol } from "../../3_services/Url.interface";
import DefaultIOR from "./DefaultIOR.class";
import UcpComponent from "../../3_services/UcpComponent.interface";

export default class UDELoader extends BaseLoader {
    private static _loaderInstance: any;

    static canHandle(ior: IOR): number {
        if (ONCE && ONCE.mode === OnceMode.NODE_JS) {
            if (ior.hostName === 'localhost' && ior.id && ior.protocol.includes(urlProtocol.ude)) {
                return 1;
            }
        }
        return 0;
    }

    canHandle(ior: IOR): number {
        return UDELoader.canHandle(ior);
    }


    async load(ior: IOR, config?: loadingConfig): Promise<any> {

        let persistanceManager = BasePersistanceManager.getPersistenceManager(ior);
        if (persistanceManager === undefined) throw new Error('No persistence manager found');
        let udeData = await persistanceManager.retrieve(ior);

        let aClass = await DefaultIOR.load(udeData.objectIor);
        let instance = new aClass() as UcpComponent<any, any>;

        instance.IOR = ior;

        instance.persistanceManager.retrieve();

        return instance;
    }


    static factory(ior: IOR): UDELoader {
        if (!this._loaderInstance) {
            this._loaderInstance = new this();
        }
        return this._loaderInstance;
    }

}

