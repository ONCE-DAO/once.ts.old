import BaseThing from "../../1_infrastructure/BaseThing.class";
import Url, { urlProtocol } from "../../3_services/Url.interface";


export enum formatType { "normal", "origin", "originPath", "normalizedHref", "path" }


type numberOrUndefined = number | undefined
@DefaultUrl.classDescriptor.addInterfaces(['Url'])
export default class DefaultUrl extends BaseThing<DefaultUrl> implements Url {
    hostNames: string[] = [];
    ports: numberOrUndefined[] = [];

    private _searchParameters: { [index: string]: any } = {};


    private _protocol: urlProtocol[] = [];
    private _pathName: string | undefined = undefined;
    private _hash: string | undefined = undefined;


    init(url: string) {
        this._parseUrl(url);
        return this;
    }

    get href() { return this._formatUrl() }
    set href(url) { this._parseUrl(url) }

    protected _parseUrl(originalUrl: string) {
        let url = originalUrl || '';

        url = this._parseProtocols(url);

        url = this._parseHost(url);

        url = this._parsePathName(url);

        url = this._parseSearch(url);

        url = this._parseHash(url);

        // Do This again if the order in the URL is wrong
        url = this._parseSearch(url);

        if (url.length > 0) {
            throw new Error(`Could not parse the url ${originalUrl} / Remaining part: ${url}`);
        }
    }

    protected _parseProtocols(url: string) {
        const protocolMatch = url.match(/^([^\/]+):(\/\/)?/);

        let protocolList: urlProtocol[] = [];
        if (protocolMatch) {

            for (const protocol of (protocolMatch[1] ? protocolMatch[1].split(':') : [])) {
                // @ts-ignore
                if (typeof urlProtocol[protocol] === undefined)
                    throw new Error("Unknown Protocol " + protocol);
                // @ts-ignore
                protocolList.push(protocol);
            }
            url = url.substring(protocolMatch[0].length);
        }
        this.protocol = protocolList;
        return url;
    }

    protected _parseHost(url: string) {
        this.hostNames = [];
        this.ports = [];
        const hostRegex = /^,?([^:\/]+)(:(\d+))?/;

        let hostMatch = url.match(hostRegex);
        while (hostMatch) {
            this.hostNames.push(hostMatch[1]);
            this.ports.push(hostMatch[3] ? +hostMatch[3] : undefined);
            url = url.substring(hostMatch[0].length);
            hostMatch = url.match(hostRegex);

        }
        return url;
    }

    protected _parsePathName(url: string) {
        let pathNameMatch = url.match(/^(\/[^?#]*)/);
        if (pathNameMatch) {
            this.pathName = pathNameMatch[1];
            url = url.substring(pathNameMatch[0].length);
        }
        return url;
    }

    protected _parseHash(url: string) {
        let hashMatch = url.match(/^#([^\?]*)/);
        if (hashMatch) {
            this.hash = hashMatch[1];
            url = url.substring(hashMatch[0].length);
        }
        return url;
    }

    protected _parseSearch(url: string): string {
        let searchMatch = url.match(/^\?([^#]*)/);
        if (searchMatch) {
            this.search = searchMatch[1];
            url = url.substring(searchMatch[0].length);
        }
        return url;
    }


    protected _formatUrl(protocolFilter: urlProtocol[] = [], type: formatType = formatType.normal) {
        let url = '';
        let protocol: urlProtocol[] = [];

        if (protocolFilter.length > 0) {
            // @ts-ignore
            protocol = this.protocol.filter(p => { return protocolFilter.includes(p) })
        } else {
            protocol = this.protocol
        }

        if (protocol && protocol.length > 0) url += protocol.join(':') + (this.hostName ? '://' : ':');

        if (type == formatType.normalizedHref || type == formatType.origin) {
            url += this.host;
        } else {
            url += this.hosts.join(',');
        }


        if (type == formatType.origin) return url;
        if (type == formatType.path) url = '';
        if (this.pathName) url += this.pathName;
        if (type == formatType.originPath) return url;
        if (this.search) url += '?' + this.search;
        if (this.hash) url += '#' + this.hash;
        return url;
    }

    get protocol(): urlProtocol[] { return this._protocol }
    get hostName(): string | undefined { return this.hostNames?.[0] }
    get port() { return this.ports?.[0] }
    get pathName() { return this._pathName }

    get hosts(): string[] {
        return this.hostNames.map((value, index) => {
            return this.hostNames[index] + (this.ports[index] ? ':' + this.ports[index] : '');
        })
    }

    get search() {
        if (!this._searchParameters || Object.keys(this._searchParameters).length === 0) return '';
        let result = Object.keys(this._searchParameters).sort().map((key) => {
            let value = (typeof this._searchParameters[key] === 'string' ? this._searchParameters[key] : JSON.stringify(this._searchParameters[key]));
            return `${key}=${value}`

        }).join('&');
        return result;
    }
    get hash(): string | undefined { return this._hash }
    get anchor(): string | undefined { return this.hash }
    get host(): string | undefined { return (this.hostNames?.[0] + (this.ports?.[0] ? ':' + this.ports?.[0] : '')) || undefined; }
    get origin(): string | undefined { return this._formatUrl([urlProtocol.https, urlProtocol.http, urlProtocol.ws, urlProtocol.wss], formatType.origin) || undefined }

    get path(): string | undefined { return this._formatUrl([], formatType.path) }

    get isOwnOrigin(): boolean {
        throw new Error("Not implemented yet");
    }

    get originPath() { return this._formatUrl([urlProtocol.https, urlProtocol.http, urlProtocol.ws, urlProtocol.wss], formatType.originPath) }

    //get defaultOrigin() { return "https://" + ONCE.ENV.ONCE_DOCKER_HOST + ":" + ONCE.httpsPort }
    //get localFileOrigin() { return ONCE.mode == Once.MODE_NODE_SERVER ? "file://" + ONCE.repositoryRootPath : ONCE.repositoryRootPath }
    get searchParameters(): { [index: string]: string } { return this._searchParameters }



    set protocol(value: urlProtocol[]) {
        value = value || [];

        // TODO@BE Make it unique
        this._protocol = value;

    }
    set hostName(value: string | undefined) {
        if (!value) {
            delete this.hostNames[0];
        } else {
            this.hostNames[0] = value;
        }
    }
    set port(value: number | undefined) { this.ports[0] = value }
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

    get fileTypes(): string[] {
        const fileName = this.fileName;
        return fileName ? fileName.split('.') : [];
    }

    get fileType(): string | undefined {
        const fileTypes = this.fileTypes;
        if (fileTypes.length > 1) {
            return fileTypes.pop();
        }
        return undefined;
    }

    get fileName(): string | undefined {
        if (!this.pathName) return undefined;
        let possibleFile = this.pathName.split('/').pop();
        if (possibleFile && possibleFile.match(/\.[\w\d]{1,10}$/)) {
            return possibleFile;
        }
        return undefined;
    }


    get normalizedHref() {
        return this._formatUrl([urlProtocol.https, urlProtocol.http, urlProtocol.ws, urlProtocol.wss], formatType.normalizedHref);
    }

    get isIOR(): boolean {
        return (this.protocol && this.protocol.includes(urlProtocol.ior) ? true : false);
    }

    clone(): Url {
        return new DefaultUrl().init(this.href);
    }

}

