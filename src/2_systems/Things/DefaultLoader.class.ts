import BaseLoader from "../../1_infrastructure/BaseLoader.class";
import IOR from "../../3_services/IOR.interface";
import { LoaderStatic } from "../../3_services/Loader.interface";
import EAMDLoader from "../EAMD/EAMDLoader.class";
import EAMDGithubLoader from '../EAMD/EAMDGithubLoader.class';


export default class DefaultLoader extends BaseLoader {

    get class(): typeof DefaultLoader {
        return DefaultLoader;
    }

    static discover(): LoaderStatic[] {
        // TODO Discover Loader over interface interface

        return [EAMDLoader, EAMDGithubLoader];
    }

    static findLoader(ior: IOR) {

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
