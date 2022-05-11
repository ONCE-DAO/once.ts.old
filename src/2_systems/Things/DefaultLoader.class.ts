import BaseLoader from "../../1_infrastructure/BaseLoader.class";
import IOR from "../../3_services/IOR.interface";
import Loader, { LoaderStatic, loadingConfig } from "../../3_services/Loader.interface";
import EAMDLoader from "../EAMD/EAMDLoader.class";
import { InterfaceDescriptor } from "./DefaultClassDescriptor.class";
import UDELoader from "./UDELoader.class";


export default class DefaultLoader extends BaseLoader {
    removeObjectFromStore(object: any): void {
        throw new Error("Method not implemented.");
    }
    addObject2Store(ior: IOR, object: any): void {
        throw new Error("Method not implemented.");
    }
    load(ior: IOR, config: loadingConfig): Promise<any> {
        throw new Error("Method not implemented.");
    }
    canHandle(ior: IOR): number {
        return 0;
    }

    static discover(): LoaderStatic[] {
        // Make sure Loader is present;
        // TODO Make it dynamic
        EAMDLoader;
        UDELoader;

        // TODO Discover Loader over interface interface

        let loaderDesc = InterfaceDescriptor.getInterfaceByNameHack('Loader');
        if (!loaderDesc) throw new Error("Missing Loader interface");
        return loaderDesc.implementations.map(d => d.class)
    }

    static findLoader(ior: IOR): Loader | undefined {

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

}
