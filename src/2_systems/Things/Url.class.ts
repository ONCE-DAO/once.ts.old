import DefaultThing from "./DefaultThing.class";
import { Once as OnceInterface } from "../../3_services/Once.interface";
import UrlInterface, { urlProtocol } from "../../3_services/Url.interface";

declare global {
    var ONCE: OnceInterface | undefined;
}

export enum formatType { "normal", "origin", "originPath" }

export default class Url extends DefaultThing implements UrlInterface {


    private _searchParameters: { [index: string]: any } = {};

    private _protocol: urlProtocol[] = [];
    private _hostName: string | undefined = undefined;
    private _port: number | undefined = undefined;
    private _pathName: string | undefined = undefined;
    private _hash: string | undefined = undefined;


    init(url: string) {
        this._parseUrl(url);
        return this;
    }


    get href() { return this._formatUrl() }
    set href(url) { this._parseUrl(url) }

    protected _parseUrl(url: string) {
        url = url || '';
        let urlParsed = url.match(/^(([^\/]+):(\/\/)?)?([^:\/]+)?(:(\d+))?(\/[^?#]*)?(\?([^#]+))?(#(.*))?$/);
        if (!urlParsed) throw new Error("Url string parse failed " + url);
        let protocolList: urlProtocol[] = [];
        for (const protocol of (urlParsed[2] ? urlParsed[2].split(':') : [])) {
            // @ts-ignore
            if (typeof urlProtocol[protocol] === undefined) throw new Error("Unknown Protocol " + protocol);
            // @ts-ignore
            protocolList.push(protocol);
        }

        if (!urlParsed[4]) {
            if (global?.ONCE?.mode !== 'BROWSER') {
                // if (!urlParsed[2]) {
                //     let serverConfig = ONCE.ENV.ONCE_DEFAULT_URL.match(/^(([^\/]+):(\/\/)?)?([^:\/]+)?(:(\d+))?/);
                //     this.protocol = (serverConfig[2] ? serverConfig[2].split(':') : []);
                //     this.hostName = serverConfig[4];
                //     this.port = serverConfig[6];
                // }
            } else {
                // @ts-ignore
                protocolList.push(document.location.protocol.replace(':', ''));
                this.hostName = document.location.hostname;
                this.port = +document.location.port;
            }
        } else {
            this.hostName = urlParsed[4];
            this.port = +urlParsed[6];
        }
        this.protocol = protocolList;
        this.pathName = urlParsed[7];
        this.search = urlParsed[9];
        this.hash = urlParsed[11];
    }


    protected _formatUrl(protocolFilter: string[] = [], type: formatType = formatType.normal) {
        let url = '';
        let protocol;
        let hostName = this.hostName;
        let port = this.port;

        if (protocolFilter.length > 0) {
            // @ts-ignore
            protocol = this.protocol.filter(p => { return protocolFilter.includes(p) })
        } else {
            protocol = this.protocol
        }

        if (protocol && protocol.length > 0) url += protocol.join(':') + (hostName ? '://' : ':');
        if (hostName) url += hostName;
        if (port) url += ':' + port;


        if (type == formatType.origin) return url;
        if (this.pathName) url += this.pathName;
        if (type == formatType.originPath) return url;
        if (this.search) url += '?' + this.search;
        if (this.hash) url += '#' + this.hash;
        return url;
    }

    get protocol(): urlProtocol[] { return this._protocol }
    get hostName(): string | undefined { return this._hostName }
    get port() { return this._port }
    get pathName() { return this._pathName }

    get search() {
        //let result = [];
        if (!this._searchParameters || Object.keys(this._searchParameters).length === 0) return '';
        let result = Object.keys(this._searchParameters).sort().map((key) => {
            let value = (typeof this._searchParameters[key] === 'string' ? this._searchParameters[key] : JSON.stringify(this._searchParameters[key]));
            return `${key}=${value}`

            // return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
        }).join('&');
        return result;
    }
    get hash(): string | undefined { return this._hash }
    get host(): string | undefined { return (this._hostName + (this._port ? ':' + this._port : '')) || undefined; }
    get origin(): string | undefined { return this._formatUrl(['https', 'http', 'ws', 'wss'], formatType.origin) || undefined }

    get isOwnOrigin(): boolean {
        throw new Error("Not implemented yet");
        /*
         if (!this.hostName) {
             return true
         } else if (this.origin === global?.ONCE?.ENV?.['ONCE_DEFAULT_URL']) {
             return true;
         }
         */
    }

    get originPath() { return this._formatUrl(['https', 'http', 'ws', 'wss'], formatType.originPath) }

    //get defaultOrigin() { return "https://" + ONCE.ENV.ONCE_DOCKER_HOST + ":" + ONCE.httpsPort }
    //get localFileOrigin() { return ONCE.mode == Once.MODE_NODE_SERVER ? "file://" + ONCE.repositoryRootPath : ONCE.repositoryRootPath }
    get searchParameters(): { [index: string]: string } { return this._searchParameters }



    set protocol(value: urlProtocol[]) {
        value = value || [];

        // TODO@BE Make it unique
        this._protocol = value;

    }
    set hostName(value: string | undefined) { this._hostName = value }
    set port(value: number | undefined) { this._port = value }
    set pathName(value: string | undefined) { this._pathName = value }
    set search(value: string | undefined) {
        if (!value) {
            this.searchParameters = {};
            return;
        }
        let parameters: { [index: string]: string } = {};
        value = value.replace(/^\?/, '');
        value = decodeURIComponent(value);
        value.split('&').forEach(x => {
            let param = x.split('=');
            // let value = decodeURIComponent(typeof param[1] == 'string' && (param[1].startsWith('{') || param[1].startsWith('[') ? JSON.parse(param[1]) : param[1]));
            // parameters[decodeURIComponent(param[0])] = value;

            let value = (typeof param[1] == 'string' && (param[1].startsWith('{') || param[1].startsWith('[')) ? JSON.parse(param[1]) : param[1]);
            parameters[param[0]] = value;
        })
        this.searchParameters = parameters;

    }
    set hash(value) { this._hash = value }
    set searchParameters(value: { [index: string]: any }) { this._searchParameters = value }

    get fileType() {
        if (!this.pathName) return null;
        let fileType = this.pathName.match(/\.([\w\d]{1,5})$/);
        if (fileType) return fileType[1];
        return null;
    }

    get fileName() {
        if (!this.pathName) return null;
        let fileName = this.pathName.match(/\/([^\/]+\.[\w\d]{1,5})$/);
        if (fileName) return fileName[1];
        return null;
    }

    get normalizeHref() {
        // let href = Thinglish.lookupInObject(this,"loader.normalizeHref");
        // if (!href) href = this._formatUrl(['https', 'http', 'ws', 'wss']);
        // return href;
        return this._formatUrl(['https', 'http', 'ws', 'wss']);
    }

    get isIOR(): boolean {
        return (this.protocol && this.protocol.includes(urlProtocol.ior) ? true : false);
    }

    clone() {

        throw new Error("Not implemented yet");

        // let clone = this.type.class.getInstance();
        // Object.keys(this._private).forEach(key => {
        //     clone._private[key] = this._private[key];
        // })
        // clone.protocol = [...this.protocol];
        // clone.searchParameters = { ...clone.searchParameters };

        // return clone;
    }

}

