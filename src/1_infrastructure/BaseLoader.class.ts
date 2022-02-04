import IORInterface from "../3_services/IOR.interface";
import IorInterface from "../3_services/IOR.interface";
import Loader, { LoaderStatic, loadingConfig } from "../3_services/Loader.interface";
import BaseThing from "./BaseThing.class";

abstract class BaseLoader extends BaseThing<BaseLoader> implements Loader {
    protected static _instance: Loader | undefined;
    private discoveredLoader: Loader[] = [];

    load(ior: IorInterface, config: loadingConfig): Promise<any> {
        throw new Error("Method not implemented.");
    }

    static canHandle(ior: IorInterface): number {
        return 0;
    }
    canHandle(ior: IorInterface): number {
        return 0;
    }

    static factory(ior: IorInterface): Loader {
        if (this._instance === undefined) {
            // @ts-ignore 
            this._instance = new this();
        }
        // @ts-ignore 
        return this._instance;
    }

    static getInstance() {
        // HACK
        // @ts-ignore
        return new this();
    }
}
export default BaseLoader;
