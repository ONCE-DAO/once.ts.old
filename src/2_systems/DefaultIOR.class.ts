import { IOR } from '../3_services/IOR.interface'
import { Loader, LoaderConfig } from '../3_services/Loader.interface'
import { URL } from '../3_services/URL.interface'
import { DefaultUrl } from './DefaultURL.class'

export class DefaultIOR extends DefaultUrl implements IOR {
    referencedObject: any = undefined
    objectID: string
    private _connection: any
    private _loader: Loader | undefined
    private _sessionManager: any
    private _securityContext: any
    static get implements () {
      return null
    }

    // does not return true but makes sure that if it is an IOR you also have an IOR object.
    static isIOR (stringOrIOR: string | DefaultIOR, forceString = false) {
      if (typeof stringOrIOR === 'string' &&
            (stringOrIOR.toLowerCase().startsWith('ior:') || forceString)) {
        return DefaultIOR.getInstance().init(stringOrIOR)
      } else if (stringOrIOR instanceof DefaultIOR) {
        return stringOrIOR
      }
      return false
    }

    static getInstance () {
      return new DefaultIOR()
    }

    static async load (iorString: string, config?: any) {
      return this.getInstance().init(iorString).load(config)
    }

    // TODO future dev
    //   static createFromObject (object:any) {
    //     const ior = IOR.getInstance()
    //     if (!object.type) {
    //       Thinglish.initType(object)
    //     }
    //     object.type.name = 'IOR:' + object.type.name
    //     ior.type = object.type
    //     return ior
    //   }
    static getIORType (urlObject: IOR | URL | string) {
      // @ts-ignore check how to make save typecheck
      const href = urlObject.href ? urlObject.href : urlObject
      if (href.startsWith('ior')) {
        if (href.includes(':ude')) {
          return 'ude'
        }
        return 'default'
      }
      return false
    }

    constructor () {
      super()
      this.referencedObject = null
      this.objectID = ''
      // this._private = this._private || {};
    }

    init (value: IOR | URL | string, queryParameters?: string): DefaultIOR {
      if (!value) { throw Error('IOR cannot be initialized on undefined.') }

      if (value instanceof DefaultIOR) {
        return value
      }
      if (value instanceof DefaultUrl) {
        value = value.href
      }
      // @ts-ignore
      if (value) { this.href = value }

      if (queryParameters) {
        this.queryParameters = queryParameters
      }
      return this
    }

    get connection () {
      return this._connection
    }

    set connection (value) {
      this._connection = value
    }

    get href () {
      return super.href
    }

    // Extra setter to add ior Protocol
    set href (value) {
      super.href = value
      if (!this.protocol.includes('ior')) {
        this.protocol.unshift('ior')
      }
    }

    // @ToDo Benedikt Refactor to search
    set queryParameters (parameter) {
      this.searchParameters = parameter
    }

    // @ToDo Benedikt Refactor to search
    get queryParameters () {
      return this.search
    }

    get isLoaded () {
      // if (!this.referencedObject && this.class) {
      //     this.referencedObject = this.class;
      // }
      return this.referencedObject != null
    }

    get class () {
      console.warn('Please refactor ior.class to ior.referencedObject')
      return this.referencedObject
    }

    set class (newValue) {
      console.warn("Please refactor 'ior.class = ...' to ior.referencedObject = ")
      this.referencedObject = newValue
    }

    // @ToDo Remove if possible as this is also the URL
    get URL () {
      return this
    }

    set URL (newURL) {
      this.url = newURL.href
    }

    get id () {
      if (this.searchParameters?.id) { return this.searchParameters.id }
      if (this.protocol.includes('ude')) {
        const id = this.pathName?.split('/').pop()
        if (id) { return id }
      }
      throw new Error('Oh shit. Please fix me')
    }

    set id (newId) {
      if (this.protocol.includes('ude')) {
        const path = this.pathName && this.pathName.split('/')
        if (path) {
          path.splice(-1)
          this.pathName = path.join('/') + '/' + newId
        }
      } else {
        super.id = newId
      }
    }

    get basePath () {
      if (!this.pathName) return undefined
      const a = this.pathName.split('/')
      a.splice(-1)
      return a.join('/')
    }

    get originBasePath () {
      if (!this.pathName) return undefined
      const a = this.pathName.split('/')
      a.splice(-1)
      return this.origin + a.join('/')
    }

    get iorUniquePath () {
      let result = 'ior:'
      // TODO future developer
      //   if (!this.protocol.includes('ude')) {
      //     result += this.origin || ONCE.ENV.ONCE_DEFAULT_URL
      //   }
      result += this.pathName
      return result
    }

    get loader () {
      if (!this._loader) {
        this.findLoader()
      }
      return this._loader
    }

    set loader (newLoader) {
      this._loader = newLoader
    }

    // @ToDo Benedikt Refactor to href
    get urlString () {
      return this.href
    }

    toString () {
      if (!this.href) {
        return 'IOR:uninitialized'
      }
      // if (!this.href.toLowerCase().startsWith("ior:")) {
      //     return 'ior:' + this.href;
      // }
      return this.href
    }

    toJSON () {
      return {
        objectID: this.objectID,
        url: this.toString(),
        queryParameters: this.queryParameters
      }
    }

    get sessionManager () {
      if (this._sessionManager) { return this._sessionManager }
      if (this._securityContext) {
        return this._securityContext.sessionManager
      }
      let sessionManager
      try {
        // @ts-ignore TODO refactor later
        sessionManager = this.loader.client(this)?.sessionManager
      } catch (err) {
        // Do nothing if it is not found
      }
      return sessionManager
    }

    set sessionManager (sessionManager) {
      this._sessionManager = sessionManager
      delete this._securityContext
    }

    // TODO future development
    // getSecurityContext () {
    //   if (!this._securityContext) {
    //     this._securityContext = SecurityContext.factory(this, this.sessionManager)
    //     this._private.securityContext
    //       .then((sc) => {
    //         this._private.securityContext = sc
    //         this._private.sessionManager.add(sc)
    //       })
    //       .catch((err) => {
    //         // Will be handled by upper try catch block
    //       })
    //   }
    //   return this._private.securityContext
    // }
    // setSecurityContext (securityContext) {
    //   this._private.securityContext = securityContext
    // }

    // TODO future development
    // add (object) {
    //   if (Thinglish.isInstanceOf(object, SessionManager)) {
    //     this._private.sessionManager = object
    //   } else if (Thinglish.isInstanceOf(object, securityContext)) {
    //     this._private.securityContext = object
    //   } else {
    //     super.add(object)
    //   }
    // }

    // TODO future development
    // async callAction (action, data) {
    //   const dataParameter = 'functionArgs'
    //   if (!action && this.hash) {
    //     action = this.hash
    //   }
    //   if (this.protocol.hasProtocol('ws') || this.protocol.hasProtocol('wss')) {
    //     let client
    //     if (this.connection) {
    //       client = this.connection
    //     } else {
    //       const wsIOR = this.clone()
    //       wsIOR.pathName = '/once/ws/ior'
    //       wsIOR.protocol.remove(/^https?$/)
    //       client = await Client.findClient(wsIOR)
    //       if (!client) { throw Error('No Client found for IOR', wsIOR.href) }
    //       this.connection = client
    //     }
    //     const actionIOR = this.clone()
    //     actionIOR.hash = action
    //     if (data) {
    //       actionIOR.searchParameters[dataParameter] =
    //                 Thinglish.serialize2IORDataStructure(data)
    //     }
    //     const result = await client.send(actionIOR)
    //     return result
    //   } else if (this.protocol.hasProtocol('local') ||
    //         ONCE.mode == Once.MODE_NODE_SERVER) {
    //     // @TODO: Need to check that it is loaded
    //     if (!this.isLoaded) {
    //       await this.load()
    //     }
    //     if (!this.isLoaded) {
    //       logger.error('Load dose not work. Can not call the Action')
    //       return null
    //     }
    //     action = action.replace(/global:\./, `global:${this.referencedObject.type.class.name}.`)
    //     const actionObject = this.referencedObject.actionIndex._findActionByString(action)
    //     if (!actionObject) {
    //       throw new Error(`Action Index not found! ${this.href} ${action} `)
    //       // logger.error("Action Index not found! ", this, action);
    //       // return undefined;
    //     }
    //     if (actionObject.visibility !== Action.VISIBILITY.GLOBAL) {
    //       logger.error("Action has the wrong visibility! expect 'global', but has " +
    //                 actionObject.visibility, actionObject)
    //       return undefined
    //     }
    //     if (!data && this.searchParameters.functionArgs) {
    //       data = this.searchParameters.functionArgs
    //     }
    //     const callData = [...data]
    //     // if (ONCE.mode === Once.MODE_NODE_SERVER && await this.getSecurityContext()) {
    //     //     callData.unshift(this.getSecurityContext());
    //     // }
    //     // callData.push(this);
    //     return await actionObject.do(...callData)
    //   } else if (this.protocol.hasProtocol('https') &&
    //         this.protocol.hasProtocol('ude')) {
    //     const client = this.loader.client(this)
    //     const callData = {
    //       actionCall: {
    //         functionArgs: data,
    //         actionId: action
    //       }
    //     }
    //     client.update(this, Thinglish.serialize2IORDataStructure(callData))
    //   } else {
    //     throw new Error('Can not do anything. Only WSS is implemented right now')
    //   }
    // }

    findLoader (): Loader {
      throw new Error('not implemented yet')
      //   if (!ONCE.global.Loader) {
      //     logger.log(this.href)
      //     this.loader =
      //             ONCE.global.EAMDucpLoader.canLoad(this) > 0
      //               ? ONCE.global.EAMDucpLoader.getInstance(this).init()
      //               : Namespaces.loader
      //     return this.loader
      //   }
      // TODO  Future Dev
      //   const loaders = ONCE.global.Loader.discover()
      //     .map((l) => {
      //       if (!(l.canLoad instanceof Function)) {
      //         logger.warn(l.name, 'does not have canLoad method')
      //         return [-1, l]
      //       }
      //       return [l.canLoad(this), l]
      //     })
      //     .sort((a, b) => b[0] - a[0])
      //   const [[matchPriority, mostSuitable]] = loaders
      //   if (!mostSuitable) {
      //     // not found
      //     this.loader = Namespaces.loader
      //     return null // this.loader;
      //   }
      //   // logger.info(`trying to find loader for ${this.href}`);
      //   // loaders.forEach(l => {
      //   //     const loadProbability = l.canLoad(this);
      //   //     logger.debug(`${l.name} returns ${loadProbability}`);
      //   //     if (loadProbability > mostSuitable.canLoad(this)) {
      //   //         mostSuitable = l;
      //   //         logger.debug(`found better loader ${l.name}`);
      //   //     }
      //   // }
      //   // );
      //   logger.debug(`==== the most suitable loader for ${this.href} is ${mostSuitable.name} initialized with ${this.href} === `)
      //   if (mostSuitable.instanceStore) {
      //     this.loader = mostSuitable.factory(this) // @ToDo remove url parameter later on
      //     return this.loader
      //   }
      //   this.loader = mostSuitable.getInstance() // new mostSuitable();
      //   if (this.loader.init instanceof Function) {
      //     this.loader.init(this.href)
      //   }
      //   return this.loader
    }

    async load (config: LoaderConfig) {
      if (!this.loader) throw new Error("couldn't find loader")
      this.referencedObject = await this.loader.load(this, config)
      return this.referencedObject
    }

    // TODO maybe deleted
    // head () {
    //   return this.loader.head(this)
    // }

    call (ior: IOR, parameter: any) {
      throw new Error('Not implemented')
      //   return ONCE.call(ior, parameter)
    }

    execute (method: string, ...rest: any[]) {
      if (!this.loader) throw new Error("couldn't find loader")

      // @ts-ignore define member variables index
      if (!(this.loader[method] instanceof Function)) {
        console.warn(`method ${method} is not defined in ${this.loader.name}`)
        return false
      }
      // @ts-ignore define member variables index
      return this.loader[method](this, ...rest)
    }
}
