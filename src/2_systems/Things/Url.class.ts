import DefaultThing from "./DefaultThing.class";
import { Once as OnceInterface } from "../../3_services/Once.interface";

declare global {
    var ONCE: OnceInterface | undefined;
}

enum formatType { "normal", "origin", "originPath" }

export class Url extends DefaultThing {


    private _searchParameters: object = {};

    private _protocol: string[] = [];
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

    get url() { return this._formatUrl() }
    set url(url) { this.href = url }

    private _parseUrl(url: string) {
        url = url || '';
        let urlParsed = url.match(/^(([^\/]+):(\/\/)?)?([^:\/]+)?(:(\d+))?(\/[^?#]*)?(\?([^#]+))?(#(.*))?$/);
        if (!urlParsed) throw new Error("Url string parse failed " + url);
        this.protocol = (urlParsed[2] ? urlParsed[2].split(':') : []);

        if (!urlParsed[4]) {
            if (global?.ONCE?.mode !== 'BROWSER') {
                // if (!urlParsed[2]) {
                //     let serverConfig = ONCE.ENV.ONCE_DEFAULT_URL.match(/^(([^\/]+):(\/\/)?)?([^:\/]+)?(:(\d+))?/);
                //     this.protocol = (serverConfig[2] ? serverConfig[2].split(':') : []);
                //     this.hostName = serverConfig[4];
                //     this.port = serverConfig[6];
                // }
            } else {
                this.protocol.push(document.location.protocol.replace(':', ''));
                this.hostName = document.location.hostname;
                this._port = +document.location.port;
            }
        } else {
            this.hostName = urlParsed[4];
            this._port = +urlParsed[6];
        }
        this.pathName = urlParsed[7];
        this.search = urlParsed[9];
        this.hash = urlParsed[11];
    }

    get formatType() {
        return formatType;
    }

    _formatUrl(protocolFilter: string[] = [], type: formatType = formatType.normal) {
        let url = '';
        let protocol;
        let hostName = this.hostName;
        let port = this.port;

        if (protocolFilter.length > 0) {
            protocol = this.protocol.filter(p => { return protocolFilter.indexOf(p) >= 0 })
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

    get protocol() { return this._protocol }
    get hostName() { return this._hostName }
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
    get hash() { return this._hash }
    get host() { return this._hostName + (this._port ? ':' + this._port : '') }
    get origin() { return this._formatUrl(['https', 'http', 'ws', 'wss'], formatType.origin) }

    get isOwnOrigin() {
        if (!this.hostName) {
            return true
        } else if (this.origin === global?.ONCE?.ENV?.ONCE_DEFAULT_URL) {
            return true;
        }
    }

    get originPath() { return this._formatUrl(['https', 'http', 'ws', 'wss'], 'originPath') }

    get defaultOrigin() { return "https://" + ONCE.ENV.ONCE_DOCKER_HOST + ":" + ONCE.httpsPort }
    get localFileOrigin() { return ONCE.mode == Once.MODE_NODE_SERVER ? "file://" + ONCE.repositoryRootPath : ONCE.repositoryRootPath }
    get searchParameters() { return this._private.searchParameters }



    set protocol(value) {
        value = value || [];
        if (!Array.isArray(value)) {
            throw Error("Only arrays are allowed in the Protocol parameter");
        }
        if (!(value instanceof ArraySet)) {
            this._private.protocol = new ArraySet();
            value.forEach(x => this._private.protocol.push(x))
        } else {
            this._private.protocol = value;
        }
        if (!this._private.protocol.hasProtocol) {
            this._private.protocol.hasProtocol = function hasProtocol(p) {
                if (p instanceof RegExp) {
                    for (let i in this) {
                        if (!isNaN(i) && this[i].match(p)) return true;
                    }
                    return false;
                } else {
                    return this.indexOf(p) !== -1;
                }
            };
        }
        //if (!this._private.protocol.remove) {
        this._private.protocol.remove = function remove(r) {
            if (r instanceof RegExp) {
                for (let i in this) {
                    if (!isNaN(i) && this[i].match(r)) this.splice(i, 1);
                }
                //this.protocol = this.filter( x => { return (x.match(r) ? false : true)})
            } else {
                const id = this.indexOf(r);
                if (id >= 0) this.splice(id, 1);
            }
        };
        //}
    }
    set hostName(value) { this._private.hostName = value }
    set port(value) { this._private.port = value }
    set pathName(value) { this._private.pathName = value }
    set search(value) {
        if (!value) {
            this._private.searchParameters = {};
            return;
        }
        let parameters = {};
        value = value.replace(/^\?/, '');
        value = decodeURIComponent(value);
        value.split('&').forEach(x => {
            let param = x.split('=');
            // let value = decodeURIComponent(typeof param[1] == 'string' && (param[1].startsWith('{') || param[1].startsWith('[') ? JSON.parse(param[1]) : param[1]));
            // parameters[decodeURIComponent(param[0])] = value;

            let value = (typeof param[1] == 'string' && (param[1].startsWith('{') || param[1].startsWith('[')) ? JSON.parse(param[1]) : param[1]);
            parameters[param[0]] = value;
        })
        this._private.searchParameters = parameters;
    }
    set hash(value) { this._private.hash = value }
    set searchParameters(value) { this._private.searchParameters = value }

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

    get isIOR() {
        return (this.protocol && this.protocol[0] == 'ior' ? true : false);
    }

    clone() {
        let clone = this.type.class.getInstance();
        Object.keys(this._private).forEach(key => {
            clone._private[key] = this._private[key];
        })
        clone.protocol = [...this.protocol];
        clone.searchParameters = { ...clone.searchParameters };

        return clone;
    }

}