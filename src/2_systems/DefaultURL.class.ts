import { URL } from './../3_services/URL.interface';
import { DefaultThing } from "./DefaultThing.class";

export class DefaultUrl extends DefaultThing {
  static get implements () {
    return null
  }

  private _protocol: string[] = [];
  private _pathName: string | undefined;
  private _port: number | undefined;
  private _hostName: string | undefined;
  private _searchParameters: any;
  private _hash: any;

  get href () {
    return this.formatUrl()
  }

  set href (url) {
    this.parseUrl(url)
  }

  get url () {
    return this.formatUrl()
  }

  set url (url) {
    this.href = url
  }

  init (url: string):URL {
    this.parseUrl(url)
    return this
  }

  private parseUrl (url: string) {
    url = url || ''
    const urlParsed = url.match(/^(([^/]+):(\/\/)?)?([^:/]+)?(:(\d+))?(\/[^?#]*)?(\?([^#]+))?(#(.*))?$/)
    if (!urlParsed || urlParsed.length < 11) {
      throw new Error('URL cannot be parsed. it doesnt have 11 elements....')
    }

    this.protocol = urlParsed[2] ? urlParsed[2].split(':') : []
    if (!urlParsed[4]) {
      // TODO ONCE MODE
      // if (ONCE.mode === 'nodeServer');
      // else {
      this.protocol.push(document.location.protocol.replace(':', ''))
      this.hostName = document.location.hostname
      this.port = Number.parseInt(document.location.port) || undefined
      // }
    } else {
      this.hostName = urlParsed[4]
      this.port = Number.parseInt(urlParsed[6]) || undefined
    }
    this.pathName = urlParsed[7]
    this.search = urlParsed[9]
    this.hash = urlParsed[11]
  }

  private formatUrl (protocolFilter: string[] = [], type = 'normal') {
    let url = ''
    let protocol
    const hostName = this.hostName
    const port = this.port
    if (protocolFilter.length > 0) {
      protocol = this.protocol.filter((p) => {
        return protocolFilter.indexOf(p) >= 0
      })
    } else {
      protocol = this.protocol
    }
    if (protocol && protocol.length > 0) { url += protocol.join(':') + (hostName ? '://' : ':') }
    if (hostName) { url += hostName }
    if (port) { url += ':' + port }
    if (type === 'origin') { return url }
    if (this.pathName) { url += this.pathName }
    if (type === 'originPath') { return url }
    if (this.search) { url += '?' + this.search }
    if (this.hash) { url += '#' + this.hash }
    return url
  }

  get protocol () {
    return this._protocol
  }

  get hostName () {
    return this._hostName
  }

  get port () {
    return this._port
  }

  get pathName () {
    return this._pathName
  }

  get search () {
    if (!this._searchParameters ||
      Object.keys(this._searchParameters).length === 0) { return '' }
    const result = Object.keys(this._searchParameters)
      .sort()
      .map((key) => {
        const value = typeof this._searchParameters[key] === 'string'
          ? this._searchParameters[key]
          : JSON.stringify(this._searchParameters[key])
        return `${key}=${value}`
        // return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
      })
      .join('&')
    return result
  }

  get hash () {
    return this._hash
  }

  get host () {
    return (this._hostName +
      (this._port ? ':' + this._port : ''))
  }

  get origin () {
    return this.formatUrl(['https', 'http', 'ws', 'wss'], 'origin')
  }

  // TODO typestuff
  // get isOwnOrigin() {
  //     if (!this._hostName) {
  //         return true;
  //     }
  //     else if (this.origin === ONCE.ENV.ONCE_DEFAULT_URL) {
  //         return true;
  //     }
  // }
  get originPath () {
    return this.formatUrl(['https', 'http', 'ws', 'wss'], 'originPath')
  }
  // TODO typestuff
  // get defaultOrigin() {
  //     return "https://" + ONCE.ENV.ONCE_DOCKER_HOST + ":" + ONCE.httpsPort;
  // }
  // TODO typestuff
  // get localFileOrigin() {
  //     return ONCE.mode == Once.MODE_NODE_SERVER
  //         ? "file://" + ONCE.repositoryRootPath
  //         : ONCE.repositoryRootPath;
  // }

  get searchParameters () {
    return this._searchParameters
  }

  set protocol (value: string[]) {
    value = value || []

    if (!Array.isArray(value)) {
      throw Error('Only arrays are allowed in the Protocol parameter')
    }

    // TODO
    // if (!(value instanceof ArraySet)) {
    //     this._private.protocol = new ArraySet();
    //     value.forEach((x) => this._private.protocol.push(x));
    // }
    // else {
    this._protocol = value
    // }

    // TODO refactor to own type
    // if (!this._private.protocol.hasProtocol) {
    //     this._private.protocol.hasProtocol = function hasProtocol(p) {
    //         if (p instanceof RegExp) {
    //             for (let i in this) {
    //                 if (!isNaN(i) && this[i].match(p))
    //                     return true;
    //             }
    //             return false;
    //         }
    //         else {
    //             return this.indexOf(p) !== -1;
    //         }
    //     };
    // }
    // //if (!this._private.protocol.remove) {
    // this._private.protocol.remove = function remove(r) {
    //     if (r instanceof RegExp) {
    //         for (let i in this) {
    //             if (!isNaN(i) && this[i].match(r))
    //                 this.splice(i, 1);
    //         }
    //         //this.protocol = this.filter( x => { return (x.match(r) ? false : true)})
    //     }
    //     else {
    //         const id = this.indexOf(r);
    //         if (id >= 0)
    //             this.splice(id, 1);
    //     }
    // };
    // }
  }

  set hostName (value) {
    this._hostName = value
  }

  set port (value) {
    this._port = value
  }

  set pathName (value) {
    this._pathName = value
  }

  set search (value) {
    if (!value) {
      this._searchParameters = {}
      return
    }
    const parameters: any = {}
    value = value.replace(/^\?/, '')
    value = decodeURIComponent(value)
    value.split('&').forEach((x) => {
      const param = x.split('=')
      // let value = decodeURIComponent(typeof param[1] == 'string' && (param[1].startsWith('{') || param[1].startsWith('[') ? JSON.parse(param[1]) : param[1]));
      // parameters[decodeURIComponent(param[0])] = value;
      const value = typeof param[1] === 'string' &&
        (param[1].startsWith('{') || param[1].startsWith('['))
        ? JSON.parse(param[1])
        : param[1]
      parameters[param[0]] = value
    })
    this._searchParameters = parameters
  }

  set hash (value) {
    this._hash = value
  }

  set searchParameters (value) {
    this._searchParameters = value
  }

  get fileType () {
    if (!this.pathName) { return null }
    const fileType = this.pathName.match(/\.([\w\d]{1,5})$/)
    if (fileType) { return fileType[1] }
    return null
  }

  get fileName () {
    if (!this.pathName) { return null }
    const fileName = this.pathName.match(/\/([^/]+\.[\w\d]{1,5})$/)
    if (fileName) { return fileName[1] }
    return null
  }

  get normalizeHref () {
    // let href = Thinglish.lookupInObject(this,"loader.normalizeHref");
    // if (!href) href = this._formatUrl(['https', 'http', 'ws', 'wss']);
    // return href;
    return this.formatUrl(['https', 'http', 'ws', 'wss'])
  }

  get isIOR () {
    return !!(this.protocol && this.protocol[0] === 'ior')
  }

  // TODO rewrite
  // clone() {
  //     let clone = this.type.class.getInstance();
  //     Object.keys(this._private).forEach((key) => {
  //         clone._private[key] = this._private[key];
  //     });
  //     clone.protocol = [...this.protocol];
  //     clone.searchParameters = { ...clone.searchParameters };
  //     return clone;
  // }
}
