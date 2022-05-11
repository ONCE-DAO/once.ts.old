
import IOR from "../3_services/IOR.interface";
import Loader, { LoaderStatic, loadingConfig } from "../3_services/Loader.interface";
import BaseThing from "./BaseThing.class";

abstract class BaseLoader extends BaseThing<BaseLoader> implements Loader {
    abstract removeObjectFromStore(object: any): void;
    abstract addObject2Store(ior: IOR, object: any): void;

    protected static _instance: Loader | undefined;
    private discoveredLoader: Loader[] = [];

    abstract load(ior: IOR, config: loadingConfig): Promise<any>

    static canHandle(ior: IOR): number {
        return 0;
    }
    abstract canHandle(ior: IOR): number

    static factory(ior: IOR): Loader {
        if (this._instance === undefined) {
            // @ts-ignore 
            this._instance = new this();
        }
        // @ts-ignore 
        return this._instance;
    }

}
export default BaseLoader;
