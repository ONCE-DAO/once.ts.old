import IORInterface from "../3_services/IOR.interface";
import IorInterface from "../3_services/IOR.interface";
import Loader, { LoaderStatic, loadingConfig } from "../3_services/Loader.interface";
import EAMDLoader from "../2_systems/EAMD/EAMDLoader.class";
import BaseThing from "./BaseThing.class";

abstract class BaseLoader extends BaseThing<BaseLoader> implements Loader {
    protected static _instance: Loader | undefined;

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

    static discover(): LoaderStatic[] {
        // TODO Discover Loader over interface interface
        return [EAMDLoader];
    }

    static findLoader(ior: IORInterface) {

        const loaderList = this.discover();
        let ratedLoader = loaderList.map(loader => {
            return { rating: loader.canHandle(ior), loader }
        })
            .filter(loader => loader.rating > 0)
            .sort((a, b) => b.rating - a.rating);

        if (ratedLoader.length > 0) {
            return ratedLoader[0].loader.factory(ior);
        }

    }



    static getInstance() {
        // HACK
        // @ts-ignore
        return new this();
    }
}
export default BaseLoader;
