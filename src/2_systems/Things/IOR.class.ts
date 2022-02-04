import { Thing } from "../../exports";

import Url, { formatType } from "./Url.class"
import { Once as OnceInterface } from "../../3_services/Once.interface";
import Loader, { loadingConfig } from "../../3_services/Loader.interface";
import IorInterface from "../../3_services/IOR.interface";
import { urlProtocol } from "../../3_services/Url.interface";


declare global {
    var ONCE: OnceInterface | undefined;
}

export class IOR extends Url implements IorInterface {

    private _referencedObject: any;
    private _loader: Loader | undefined;
    public namespace: string | undefined;
    public namespaceVersion: string | undefined;

    // static async load<T extends Thing>(url: string, name: string): Promise<{ new(): T } | undefined> {
    //     try {
    //         const imported: any = await import(url)
    //         return imported[name]
    //     }
    //     catch {
    //         // perhaps return a more specific element with error description but not for poc
    //         return undefined
    //     }
    // }

    static async load(iorString: string, config: loadingConfig) {
        return new this().init(iorString).load(config);
    }


    static getIORType(urlObject: IOR | string) {
        const href = (urlObject instanceof IOR ? urlObject.href : urlObject)

        if (href.startsWith('ior')) {
            if (href.includes(':ude')) {
                return 'ude';
            }
            return 'default';
        }
        return false;
    }


    init(url: string) {
        this.href = url;
        return this;
    }

    get href() {
        return super.href;
    }

    // Extra setter to add ior Protocol 
    set href(value: string) {

        super.href = value;
        if (!this.protocol.includes(urlProtocol.ior)) {
            this.protocol.unshift(urlProtocol.ior);
        }

    }

    protected _parseUrl(url: string): void {
        if (!url.includes("esm")) {
            super._parseUrl(url);
            return;
        }

        let urlParsed = url.match(/^([^\/]+):([^:\[]+)(\[([\^\.\dlatest]+)\])?$/);
        if (!urlParsed) throw new Error("Url string parse failed " + url);
        let rawProtocolList: string[] = urlParsed[1] ? urlParsed[1].split(':') : [];

        let protocolList: urlProtocol[] = [];
        for (const protocol of rawProtocolList) {
            // @ts-ignore
            if (typeof urlProtocol[protocol] === undefined) throw new Error("Unknown Protocol " + protocol);
            // @ts-ignore
            protocolList.push(protocol);
        }
        this.protocol = protocolList;

        this.namespace = urlParsed[2];
        this.namespaceVersion = urlParsed[4];
    }

    protected _formatUrl(protocolFilter: string[] = [], type: formatType = formatType.normal) {

        if (!this.protocol.includes(urlProtocol.esm)) {
            return super._formatUrl(protocolFilter, type);
        }
        let url = '';

        let protocol;

        if (protocolFilter.length > 0) {
            // @ts-ignore
            protocol = this.protocol.filter(p => { return protocolFilter.includes(p) })
        } else {
            protocol = this.protocol
        }
        if (type === formatType.origin) return '';
        url += protocol.join(':') + ':';
        url += this.namespace;
        if (this.namespaceVersion) url += `[${this.namespaceVersion}]`

        return url;
    }

    get isLoaded() {
        // if (!this._referencedObject && this.class) {
        //     this._referencedObject = this.class;
        // }
        return this._referencedObject !== undefined;
    }

    get id() {
        if (this.searchParameters?.id) return this.searchParameters.id

        if (this.protocol.includes(urlProtocol.ude)) {
            const id = this.pathName?.split('/').pop();
            if (id) return id;
        }
        return super.id;
    }

    set id(newId) {
        if (this.protocol.includes(urlProtocol.ude)) {
            let path = this.pathName?.split('/')
            if (!path) throw new Error('Wron ude Format')
            path.splice(-1)
            this.pathName = path.join('/') + '/' + newId

        }
    }

    get basePath(): string | undefined {
        if (!this.pathName) return undefined;
        let a = this.pathName.split('/');
        a.splice(-1);
        return a.join('/');
    }

    get originBasePath(): string | undefined {
        if (!this.pathName) return undefined;
        let a = this.pathName.split('/');
        a.splice(-1);
        return this.origin + a.join('/');
    }

    get udeUniquePath() {
        let result = 'ior:';

        if (!this.protocol.includes(urlProtocol.ude)) {
            //TODO@BE hack
            //@ts-ignore
            result += this.origin || global.ONCE?.ENV?.ONCE_DEFAULT_URL;
        }
        result += this.pathName;
        return result;
    }

    get loader(): Loader {

        if (!this._loader) {
            this._loader = this.findLoader();
        }
        if (!this._loader) throw new Error("No loader found")
        return this._loader;
    }

    set loader(newLoader: Loader) {
        this._loader = newLoader;
    }


    findLoader(): Loader | undefined {
        /*if (!ONCE.global.Loader) {
            logger.log(this.href);
            this.loader = (ONCE.global.EAMDucpLoader.canLoad(this) > 0) ? ONCE.global.EAMDucpLoader.getInstance(this).init() : Namespaces.loader;
            return this.loader;
        }
        const loaders = ONCE.global.Loader.discover().map(l => {
            if (!(l.canLoad instanceof Function)) {
                logger.warn(l.name, 'does not have canLoad method');
                return [-1, l];
            }
            return [l.canLoad(this), l];
        }
        ).sort((a, b) => b[0] - a[0]);
        let [[matchPriority, mostSuitable]] = loaders;
        if (!mostSuitable) {
            // not found
            this.loader = Namespaces.loader;
            return null; //this.loader;
        }
        //logger.info(`trying to find loader for ${this.href}`);
        // loaders.forEach(l => {
        //     const loadProbability = l.canLoad(this);
        //     logger.debug(`${l.name} returns ${loadProbability}`);
        //     if (loadProbability > mostSuitable.canLoad(this)) {
        //         mostSuitable = l;
        //         logger.debug(`found better loader ${l.name}`);
        //     }
        // }
        // );
        logger.debug(`==== the most suitable loader for ${this.href} is ${mostSuitable.name} initialized with ${this.href} === `);

        if (mostSuitable.instanceStore) {
            this.loader = mostSuitable.factory(this); //@ToDo remove url parameter later on
            return this.loader;
        }

        this.loader = mostSuitable.getInstance();  //new mostSuitable();
        if (this.loader.init instanceof Function) {
            this.loader.init(this.href);
        }

        return this.loader;*/

        return undefined;
    }


    async load(config: loadingConfig) {
        // return Promise.resolve(this.loader.load(this));
        let loadingPromiseOrObject = this.loader.load(this, config);
        loadingPromiseOrObject.then(object => {
            if (object) {
                this._referencedObject = object;
            }
        }).catch(error => { });
        return loadingPromiseOrObject;
    }
}

export default IOR;