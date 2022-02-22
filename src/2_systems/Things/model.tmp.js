

var UcpModelV2 = Namespace.declare(
    class UcpModelV2 extends Thing {
        static get implements() {
            return [Model, EventSupport];
        }

        static get STATE() {
            return {
                TRANSACTION_OPEN: "transactionOpen",
                BEFORE_CHANGE: "beforeChange",
                ON_CHANGE: "onChange",
                AFTER_CHANGE: "afterChange",
                TRANSACTION_CLOSED: "transactionClosed",
                TRANSACTION_ROLLBACK: "transactionRollback",
            }
        }

        static get LOADING_MODE() {
            return {
                ON_LOAD: 'onLoading',
                ON_ACCESS: 'onAccess'
            }
        }

        static get EVENT() {
            return {
                ON_MODEL_WILL_CHANGE: "onModelWillChange",
                MODEL_CHANGED: "modelChanged",
            }
        }


        static async then(onSuccess) {
            let result = [];
            let ucpModels = this.objectStore.lookup();

            for (const ucpModel of ucpModels) {
                if (ucpModel._private) {
                    //logger.warn(`await ucpModel ${ucpModel.id} / ${ucpModel.status} / ${ucpModel.ucpComponent.name}`);
                    await ucpModel;
                }
            }
            onSuccess(result);
        }

        static get objectStore() {
            this._private = this._private || {};
            if (!this._private.objectStore) {
                this._private.objectStore = WeakRefPromiseStore.getInstance().init();
            }
            return this._private.objectStore;
        }

        createDataProxy(originalData, parent, valueName, proxyPath = []) {

            const ucpModel = this;
            let createMode = true;

            const getSchema = (path = proxyPath) => {
                return ucpModel._getSchema(path);
            }

            let defaultProxyFunctions = {};

            const schema = getSchema();
            // let dataStructure;
            // Working with Schema
            if (schema) {
                if (['object', 'array'].includes(schema.type)) {
                    // Need a Proxy
                    // if (schema.type == 'array') dataStructure = [];
                    // if (schema.type == 'object') dataStructure = {};
                } else if (['string', 'number', 'boolean', 'any', 'alternatives'].includes(schema.type)) {
                    return originalData;
                } else if (schema.type == 'ior') {
                    ucpModel.loaded = false;
                    if (typeof originalData === 'string' && IOR.getIORType(originalData) !== false) {
                        return new IOR().init(originalData);
                    }
                    return originalData;
                } else if (schema.type === 'relationship') {
                    // Local reference
                    return originalData;
                }

                // Working without schema
            } else {
                if (typeof originalData === 'string' && IOR.getIORType(originalData) !== false) {
                    ucpModel.loaded = false;
                    return new IOR().init(originalData);
                } else if (originalData instanceof IOR) {
                    return originalData;
                } else if (Thinglish.isPrimitive(originalData) || Thinglish.isInstanceOf(originalData, UcpComponent) || Thinglish.isClass(originalData)) {
                    return originalData;
                } else if (Thinglish.isInstanceOf(originalData, Thing)) {
                    return originalData; // Lets hope that it works 
                    //throw new Error("Not allowed to add a Object of type Thing");
                    // } else {
                    //   dataStructure = new originalData.constructor();
                } else if (typeof HTMLElement !== "undefined" && originalData instanceof HTMLElement) {
                    return originalData;
                }
            }

            let dataStructure
            if (typeof originalData.constructor !== "undefined") {
                dataStructure = new originalData.constructor();
            } else {
                // The object is something strange...
                dataStructure = {};
            }

            // It looks like we need a new Proxy

            dataStructure.changeLog = (path = []) => {
                if (valueName) path.push(valueName);
                let parent = dataStructure._getParent();
                if (parent instanceof UcpModelV2) {
                    return parent.getChangeLog(path);
                } else {
                    return parent.changeLog(path);
                }
            };

            dataStructure.validate = (value, key) => {
                const path = [...proxyPath]
                if (key) path.push(key);
                const schema = ucpModel._getSchema(path)
                if (!schema) return new Error("No Schema found");
                return schema.validate(value)?.error;
            }

            dataStructure.load = () => {
                return ucpModel.load();
            };

            dataStructure._getParent = () => {
                return parent
            };

            dataStructure._getSchema = getSchema;

            dataStructure._setParent = (value, name) => {
                parent = value; valueName = name
            };

            dataStructure.ucpModel = () => {
                return ucpModel;
            };

            dataStructure._destroy = () => {

                Object.keys(dataStructure).forEach(key => {
                    const value = dataStructure[key];
                    if (value && value._isModelProxy && typeof value._loadIOR === 'function') value._destroy();
                    delete dataStructure[key];
                });
            }


            dataStructure._reportChanges = (action) => {
                action.key = (valueName ? `${valueName}.` : '') + action.key;
                return dataStructure._getParent()._reportChanges(action);
            }


            const handler = {
                get: (target, key) => {
                    if (key == "_isModelProxy") return true;

                    //ONCE.addStatistic(`${ucpModel.name}.proxyGet.total`);

                    const value = target[key];
                    if (value == undefined) return undefined;
                    if (typeof value == "function") return value; //@ToDo Need to change that

                    //ONCE.addStatistic(`${ucpModel.name}.proxyGet.${ucpModel.ucpComponent.type.name.replaceAll('.', '-')}.${proxyPath.join('.')}${proxyPath.length > 0 ? '.' : ''}${key}.statisticValue`);

                    if (ONCE.mode === Once.MODE_NODE_SERVER && ucpModel._private.securityActive) {

                        const accessGrant = ucpModel.validateAccess([key], 'readAccess', schema)
                        // const schema = getSchema();

                        const ucpComponent = ucpModel.ucpComponent;
                        if (accessGrant == false) {
                            logger.info(`Access denied for Key ${key} in ${ucpComponent.id}`);
                            return undefined;
                        }
                    }

                    if (value instanceof IOR && ucpModel._private.loadingMode === UcpModelV2.LOADING_MODE.ON_ACCESS) {
                        return value.load();
                    }

                    return value;

                },
                set: (target, property, value, receiver) => {

                    // @ToDo should be removed late if everything is migrated into the new Model
                    if (valueName == undefined && property === 'autoUpdate') {
                        ucpModel.autoUpdate = value;
                        return true;
                    }
                    if (Array.isArray(target) && property == 'length') {
                        target[property] = value;
                    }

                    // Already the same value
                    if (value === target[property]) {
                        return true;
                    }

                    // Can be used for Creating Set statistics
                    //ONCE.addStatistic(`${ucpModel.name}.proxySet.${ucpModel.ucpComponent.type.name.replaceAll('.', '-')}.${proxyPath.join('_') + '_' + property}`);

                    //Validate Write Access

                    //let modelHasOwner = false;
                    // This Complex Block is needed to avoid a DeadLoops

                    if (property == 'owner' && valueName === '_access') {
                        ucpModel._private.securityActive = true;
                    }

                    if (ONCE.mode === Once.MODE_NODE_SERVER && ucpModel._private.securityActive) {
                        const accessGrant = ucpModel.validateAccess([property], 'writeAccess', schema);

                        if (accessGrant == false) {
                            logger.info(`Write Access denied for Key ${property} in ${ucpModel.ucpComponent.id}`);
                            return true;
                        }
                    }

                    // Allow Promises to be written directly to the Model. No Transaction is started
                    if (Thinglish.isPromise(value)) {
                        const originalValue = target[property];
                        target[property] = value;
                        //@ToDo update on promise resolve?
                        value.then(x => {
                            receiver[property] = x
                        }
                        ).catch(e => {
                            target[property] = originalValue;
                        });
                        return true;
                    }

                    //@ToDo Check if writeable

                    let proxyValue;
                    if (value && value._isModelProxy) {
                        proxyValue = value;
                        proxyValue._setParent(receiver, property);
                    } else {

                        proxyValue = this.createDataProxy(value, receiver, property, [...proxyPath, property]);
                    }

                    // If the is still in creation no reports are send
                    if (createMode) {
                        target[property] = proxyValue;
                    } else {

                        let action = new ParticleSnapshotAction().init({
                            to: proxyValue,
                            key: (valueName !== undefined ? `${valueName}.` : '') + property
                        });

                        if (target.hasOwnProperty(property)) {
                            action.from = target[property];
                            action.method = 'set';
                        } else {
                            action.from = undefined;
                            action.method = 'create';
                        }

                        //this._checkForIOR(proxyValue);
                        let result = Reflect.set(target, property, proxyValue);

                        //target[property] = proxyValue;

                        parent._reportChanges(action)
                        return result;

                    }
                    return true;
                },
                deleteProperty: (target, property) => {

                    // Dose not exists
                    if (!target.hasOwnProperty(property)) return true;

                    if (ONCE.mode === Once.MODE_NODE_SERVER && ucpModel._private.securityActive) {

                        const accessGrant = ucpModel.validateAccess([property], 'writeAccess', schema);

                        if (accessGrant == false) {
                            logger.info(`Write Access denied for Key ${property} in ${ucpModel.ucpComponent.id}`);
                            return true;
                        }
                    }

                    //@ToDo Check if writeable
                    let action = new ParticleSnapshotAction().init({
                        to: undefined,
                        method: ParticleSnapshotAction.METHOD_DELETE,
                        from: target[property],
                        key: (valueName !== undefined ? `${valueName}.` : '') + property
                    });

                    if (parent._reportChanges(action)) {
                        if (Array.isArray(target)) {
                            target.splice(property, 1);
                        } else {
                            delete target[property];
                        }
                    }
                    return true;
                },
                has: (target, prop) => {
                    if (target[prop] && !defaultProxyFunctions[prop]) { return true; }
                    return false;
                },
                ownKeys: (target) => {
                    return Reflect.ownKeys(target).filter(key => !defaultProxyFunctions[key]);
                }
            }

            let proxy = new Proxy(dataStructure, handler);

            dataStructure.multiSet = (data2Set, forceOverwrite = false) => {
                let transactionOpen = false;
                if (ucpModel.status == UcpModelV2.STATE.TRANSACTION_OPEN) {
                    transactionOpen = true;
                } else if (!createMode) {
                    ucpModel.startTransaction();
                }

                Object.keys(data2Set).forEach(key => {
                    let newValue = data2Set[key];

                    if (proxy[key] && typeof proxy[key].multiSet === 'function') {
                        proxy[key].multiSet(newValue, forceOverwrite);
                    } else {
                        proxy[key] = newValue;
                    }
                });

                if (forceOverwrite) {
                    Object.keys(dataStructure).forEach(key => {
                        if (typeof data2Set[key] == "undefined" && !defaultProxyFunctions[key]) delete proxy[key];
                    });
                }

                //@ToDo need to do Force and delete all other Parameter

                if (!transactionOpen && !createMode) return ucpModel.processTransaction();
            }

            dataStructure._loadIOR = () => {
                // let ids2Delete = [];
                // for (let [key, value] of Object.entries(dataStructure)) {
                //   if (value && value._isModelProxy && typeof value._loadIOR === 'function') await value._loadIOR();
                //   if (value instanceof IOR && typeof value.load === 'function') {
                //     if (ONCE.mode === Once.MODE_NODE_SERVER) {
                //       value.sessionManager = ucpModel.ucpComponent.IOR.sessionManager;
                //     }
                //     let result = await value.load();

                //     if (dataStructure[key]?.loadingError && dataStructure[key]?.loadingError === RESTClient.LOADING_ERROR.NOT_EXISTING) {
                //       logger.error(`Deleting UDE from Model because it is not existing! In: ${ucpModel.ucpComponent.type.name} ${ucpModel.ucpComponent.IOR.href} Model ${proxyPath.join('.')}.${key}`);
                //       ids2Delete.push(key);
                //     } else {
                //       dataStructure[key] = result
                //     }
                //   }
                // };
                // if (ids2Delete.length > 0) {
                //   for (let key of ids2Delete.reverse()) {
                //     delete proxy[key];
                //   }
                // }

                let promiseArray = [];
                for (let [key, value] of Object.entries(dataStructure)) {
                    if (defaultProxyFunctions[key]) {
                        //ignore
                    } else if (value && value._isModelProxy && typeof value._loadIOR === 'function') {
                        promiseArray.push(...value._loadIOR());
                    } else if (value instanceof IOR && typeof value.load === 'function') {
                        if (ONCE.mode === Once.MODE_NODE_SERVER) {
                            value.sessionManager = ucpModel.ucpComponent.IOR.sessionManager;
                        }

                        let promiseOrObject = value.load();
                        if (Thinglish.isPromise(promiseOrObject)) {

                            let promiseHandler = Thinglish.createPromise();

                            promiseArray.push(promiseHandler.promise);
                            promiseOrObject.then(result => {
                                promiseHandler.setSuccess(result);
                                if (dataStructure[key]?.loadingError && dataStructure[key]?.loadingError === RESTClient.LOADING_ERROR.NOT_EXISTING) {
                                    logger.error(`Deleting UDE from Model because it is not existing! In: ${ucpModel.ucpComponent.type.name} ${ucpModel.ucpComponent.IOR.href} Model ${[...proxyPath, key].join('.')}`);

                                    ucpModel._private.deleteAfterLoad = ucpModel._private.deleteAfterLoad || [];
                                    ucpModel._private.deleteAfterLoad.push([proxyPath.join('.'), key]);

                                } else if (dataStructure[key]?.loadingError) {
                                    logger.error(`Some Error During loading of the IOR! In: ${ucpModel.ucpComponent.type.name} ${ucpModel.ucpComponent.IOR.href} Model ${[...proxyPath, key].join('.')}`);

                                } else {
                                    dataStructure[key] = result;
                                }
                            });
                        } else {
                            dataStructure[key] = promiseOrObject;
                        }
                    }
                }
                return promiseArray;


            }

            for (let f of Object.keys(dataStructure)) {
                defaultProxyFunctions[f] = true;
            }

            proxy.multiSet(originalData);
            createMode = false;
            return proxy;
        }


        _filterWithSecurityContext(data, path = []) {
            if (ONCE.mode !== Once.MODE_NODE_SERVER) return data;
            let schema = this._getSchema(path);
            if (!schema) return data;


            const ucpModel = this;
            const filter = function (data, currentPath) {
                let result = Array.isArray(data) ? [] : {};
                let set = false;
                for (const [key, value] of Object.entries(data)) {
                    const innerPath = [...currentPath, key]
                    if (ucpModel.validateAccess(innerPath, 'readAccess')) {
                        if (value instanceof ParticleSnapshotAction) {
                            result[key] = value;
                            set = true;
                        } else {
                            const subResult = filter(value, innerPath);
                            if (subResult) {
                                result[key] = subResult;
                                set = true;
                            }
                        }
                    }
                }
                return set ? result : null;

            }

            return filter(data, path);

        }

        _schemaIsLocal(schema, key) {
            let keySchema
            switch (schema.type) {
                case 'relationship':
                    return true;
                case 'object':
                    keySchema = schema.getKeys()?.[key];
                    if (keySchema?.isLocalOnly() == true || keySchema?.type == 'relationship') return true;
                    break;
                case 'array':
                    keySchema = schema.getItems()[0];
                    if (keySchema?.isLocalOnly() == true || keySchema?.type == 'relationship') return true;
                    break;
            }
            return false;
        }

        deepCopy(source, target, schema = this.schema, storageExport = false) {

            let originalLoadingMode = this.loadingMode;
            this.loadingMode = UcpModelV2.LOADING_MODE.ON_LOAD;

            // @ToDo Need to rework that with the Schema
            if (schema) {
                if (['ior', 'relationship'].includes(schema.type)) {
                    target = source;
                    return target;
                }
            }

            if (target == undefined) target = Array.isArray(source) ? [] : {};
            if (typeof source !== "object" || source === null) {
                return source
            }
            if (source == undefined) return target;

            for (const key of Object.keys(source)) {
                if (storageExport == true && this._schemaIsLocal(schema, key)) continue;

                let value = source[key];

                if (value && value._isModelProxy) {
                    let subSchema;
                    if (schema?.type == 'object') {
                        subSchema = schema.getKeys()?.[key]
                    } else if (schema?.type == 'array') {
                        subSchema = schema.getItems()[0]
                    }

                    target[key] = this.deepCopy(value, Array.isArray(value) ? [] : {}, subSchema, storageExport);
                } else {
                    target[key] = value;
                }
            }

            this.loadingMode = originalLoadingMode;

            return target
        }

        startTransaction(config = {}) {
            if (this.status == UcpModelV2.STATE.TRANSACTION_CLOSED) {
                if (this._private.runningTransaction) {
                    console.error("Already open UcpModel Transaction");
                    return false;
                }
                this._private.transaction.version = (config && config.version ? config.version : this._private.transaction.version);
                this.status = UcpModelV2.STATE.TRANSACTION_OPEN;

                if (config && config.version) this._private.transaction.version = config.version;

                let version = config.version || UUID.uuidv4();
                let predecessorVersion = config.predecessorVersion || this.version;

                this._private.runningTransaction = ParticleSnapshot.getInstance().init({ version: version, predecessorVersion: predecessorVersion, ucpModel: this, time: config.time, creatingInstance: config.creatingInstance });

                // Transfer the Current State into the particleSnapshot
                let oldValueFullAccess = this._private.fullAccess;
                this._private.fullAccess = true;
                this.deepCopy(this.model, this._private.runningTransaction.data);
                this._private.fullAccess = oldValueFullAccess;
                return true;
            } else if (this.status == UcpModelV2.STATE.TRANSACTION_OPEN) {
                //Transaction is already open
            } else {
                console.error("Status doesn't allow to start processing", this.status);

            }
            return false;
        }

        processTransaction(config) {

            // Can be used to get statistics
            // ONCE.addStatistic(`${this.name}.processTransaction.total`);
            // ONCE.addStatistic(`${this.name}.processTransaction.${this.ucpComponent.type.name.replaceAll('.', '-')}`);

            if (this.status !== UcpModelV2.STATE.TRANSACTION_OPEN) {
                this.startTransaction(config);
            } else {
                if (config) {
                    throw new Error("Can not process the config");
                }
            }
            const particleSnapshot = this._private.runningTransaction;

            if (particleSnapshot.openChanges === 0) {
                console.debug("No Actions in Transaction. Skip it.");
                this.cancelTransaction();
                return false;
            }

            /// ####### STATE.BEFORE_CHANGE ##########
            this.status = UcpModelV2.STATE.BEFORE_CHANGE;



            // Callback to onModelWillChange
            try {

                if (typeof this.ucpComponent.onModelWillChange == 'function') {
                    let result = this.ucpComponent.onModelWillChange(particleSnapshot.changeLog);
                    if (Thinglish.isPromise(result)) {
                        throw new Error("onModelWillChange can not be async");
                    }
                }

            } catch (err) {
                this.cancelTransaction();
                throw err;
            }

            // Validate the data with the schema
            if (this.schema) {
                const { error, value } = this.schema.validate(particleSnapshot.data);
                if (error) {
                    this.status = UcpModelV2.STATE.TRANSACTION_CLOSED;
                    error.message = this.ucpComponent.type.class.name + ': ' + error.message + `; value: ` + Thinglish.lookupInObject(error._original, error.details[0].path.join('.'), { noNull: true });
                    error.stack = new Error(error.message).stack;
                    this.cancelTransaction();
                    throw error;
                }
            }


            this._private.wave.push(particleSnapshot);
            // Remove the Running Transaction as it is active now
            delete this._private.runningTransaction;

            /// ####### STATE.ON_CHANGE ##########
            this.status = UcpModelV2.STATE.ON_CHANGE;

            // Fire modelChanged
            const modelChangedResult = this.eventSupport.fire(UcpModelV2.EVENT.MODEL_CHANGED, this, particleSnapshot);

            /// ####### STATE.AFTER_CHANGE ##########
            // This needs to be done from the Controller this.status = UcpModelV2.STATE.AFTER_CHANGE;


            modelChangedResult.then((result) => {
                particleSnapshot.promiseHandler.setSuccess(result);

            }).catch(err => {
                particleSnapshot.promiseHandler.setError(err);

                logger.error(`UcpModel Transaction failed ${this.ucpComponent.name} \n ${err.stack}`);
                //logger.error(err);
                //logger.error(err.stack);
            });

            /// ####### STATE.TRANSACTION_CLOSED ##########
            this.status = UcpModelV2.STATE.TRANSACTION_CLOSED;

            logger.debug("Transaction " + this.version + " Closed successfully!", this);

            return this;

        }


        get writeAccessObjects() {
            if (!this._private.writeAccessObjects) {
                const schema = this.schema;

                this._private.writeAccessObjects = new ArraySet('writeAccess');

                const getWriteAccess = (subSchema, list) => {
                    let sub;
                    const writeAccessObject = subSchema.getWriteAccess();
                    if (writeAccessObject) list.push(writeAccessObject);

                    if (typeof subSchema.getKeys == 'function') {
                        sub = subSchema.getKeys();
                    } else if (typeof subSchema.getItems == 'function') {
                        //@ToDo Need to find a way to select the correct Item if multiple are existing
                        sub = subSchema.getItems();
                    }
                    if (sub) {
                        for (const innerSubSchema of Object.values(sub)) {
                            getWriteAccess(innerSubSchema, list)
                        }
                    }
                }
                getWriteAccess(schema, this._private.writeAccessObjects);
            }
            return this._private.writeAccessObjects;
        }

        validateAccess(path, accessGroup = 'readAccess', subSchema) {
            if (ONCE.mode !== Once.MODE_NODE_SERVER) return true;
            if (this._private.fullAccess === true) return true;

            const schema = this._getSchema(path, subSchema);
            const securityContext = this.ucpComponent.securityContext;
            if (!securityContext) {
                throw new Error("Missing a Security Context. Please check the Access way to this Component");
            }
            let parameterUserRole = accessGroup;

            if (schema) {
                parameterUserRole = schema[(accessGroup === 'readAccess') ? 'getReadAccess' : 'getWriteAccess']() || parameterUserRole;
            }
            const accessGrant = securityContext.hasRole(parameterUserRole);
            if (!accessGrant) logger.warn(`${path.join('.')} ${accessGroup} => ${accessGrant} `);
            return accessGrant;
        }

        _reportChanges(action) {
            const status = this.status;


            if ([UcpModelV2.STATE.TRANSACTION_CLOSED, UcpModelV2.STATE.BEFORE_CHANGE, UcpModelV2.STATE.ON_CHANGE, UcpModelV2.STATE.TRANSACTION_OPEN].includes(status)) {

                if (status === UcpModelV2.STATE.TRANSACTION_CLOSED) {
                    this.startTransaction();
                }
                this.latestVersion.addAction(action);
                if (status === UcpModelV2.STATE.TRANSACTION_CLOSED) this.processTransaction();
                return true;
            } else if (status === UcpModelV2.STATE.AFTER_CHANGE) {
                // Changes are not allowed to be done during Rendering of a View
                console.error("No changes on the Model are allowed during View rendering! Please move the change into onModelChanged")

            } else if (status === UcpModelV2.STATE.TRANSACTION_ROLLBACK) {
                return true; // In this state we write the Model directly
            } else {
                throw new Error("Missing state Processing: " + status)
            }
            return false;
        }

        // Thenable object can be awaited. In this case the Transaction.
        async then(onSuccess, onRejected) {
            if (this.latestVersion && this.latestVersion.promiseHandler) {
                try {
                    onSuccess(await this.latestVersion.promiseHandler.promise);
                } catch (err) {
                    onRejected(err);
                }
            } else {
                onSuccess(true);
            }
        }

        init(ucpComponent) {
            this._private = {
                ucpComponent: ucpComponent,
                status: UcpModelV2.STATE.TRANSACTION_CLOSED,
                loaded: true,
                wave: [],
                transaction: { version: null, action: [] },
                fullAccess: false,
                loadingMode: UcpModelV2.LOADING_MODE.ON_LOAD,
            };

            //this._private.data = this.createDataProxy({}, this, undefined);

            //this.eventSupport.addEventListener(UcpModelV2.EVENT.ON_MODEL_WILL_CHANGE, this, this.controller.onModelWillChange.bind(this.controller));
            this.eventSupport.addEventListener(UcpModelV2.EVENT.MODEL_CHANGED, this, this.controller.modelChanged.bind(this.controller));
            UcpModelV2.objectStore.register(this.id, this);
            return this;
        }

        cancelTransaction() {
            if (this.status === UcpModelV2.STATE.TRANSACTION_OPEN) {
                this._private.transaction = { version: null, particle: [], action: [] }
                delete this._private.runningTransaction;

                this.status = UcpModelV2.STATE.TRANSACTION_ROLLBACK;
                let newModel = {};

                // Transfer the Current State into the particleSnapshot
                let oldValueFullAccess = this._private.fullAccess;
                this._private.fullAccess = true;
                this.deepCopy(this.latestVersion.data, newModel);
                this.model = newModel;
                this._private.fullAccess = oldValueFullAccess;


                this.status = UcpModelV2.STATE.TRANSACTION_CLOSED;

                // @ToDo !!!! Need to reset to old Version
            } else {
                console.warn("Can not clear Transaction in this State", this.status)
            }
        }

        async load() {
            if (this._private.loadingMode != UcpModelV2.LOADING_MODE.ON_LOAD) {
                console.info("Loading is disabled");
            } else if (this.loaded === true) {

            } else if (this._private.loadPromise) {
                await this._private.loadPromise;

            } else {

                //this._private.loadPromise = this._private.data._loadIOR();
                const promiseList = this._private.data._loadIOR();
                this._private.loadPromise = Promise.allSettled(promiseList);
                await this._private.loadPromise;
                delete this._private.loadPromise;
                await Thinglish.wait(10); // Wait to complete the "then" in the proxy
                if (this._private.deleteAfterLoad) {
                    this.startTransaction();
                    const list = this._private.deleteAfterLoad.sort((a, b) => {
                        const path = a[0].localeCompare(b[0]);
                        if (path !== 0) return path;
                        const a1 = isNaN(a[1]) ? ParseInt(a[1]) : a[1];
                        const b1 = isNaN(b[1]) ? ParseInt(b[1]) : b[1];
                        return b1 - a1;
                    });
                    for (const [objectPath, key] of list) {

                        const object = Thinglish.lookupInObject(this.model, objectPath);
                        if (Array.isArray(object)) {
                            object.splice(key, 1); //@ToDo Need to fix that
                        } else {
                            delete object[key];
                        }
                    }
                    await this.processTransaction();
                    delete this._private.deleteAfterLoad;
                }
                if (this._private.updateDuringLoading == true) {
                    delete this._private.updateDuringLoading;
                    return await this.load();
                } else {
                    this.loaded = true;
                }

            }
            return true;

        }

        save() {
            console.warn("Refactor: Not sure what should be saved");
        }

        get loadingMode() { return this._private.loadingMode; }
        set loadingMode(newValue) {
            this._private.loadingMode = newValue;
        }

        // Only for reverse compatibility. The new function startTransaction and processTransaction should be used
        get autoUpdate() {
            logger.debug("Refactor: Only for reverse compatibility. The new function ucpModel.status should be used instead of autoUpdate");
            return this._private.status !== UcpModelV2.STATE.TRANSACTION_OPEN
        }

        // Only for reverse compatibility. The new function startTransaction and processTransaction should be used
        set autoUpdate(value) {
            logger.info("Refactor: Only for reverse compatibility. The new function startTransaction and processTransaction should be used instead of autoUpdate");
        }

        getChangeLog(path) {
            let pathFormatted = path.join('.');
            if (pathFormatted) {
                return Thinglish.lookupInObject(this.changeLog, pathFormatted);
            } else {
                return this.changeLog;
            }
        }


        _getSchema(pathInput = [], schema = this.schema) {
            const path = [...pathInput];
            if (!schema) return null;

            while (path.length > 0) {
                let key = path.shift();
                if (typeof schema.getKeys == 'function') {
                    let newSchema = schema.getKeys()?.[key];
                    if (!newSchema) {
                        if (schema?.ruleset?.$_terms?.patterns?.[0]?.rule) {
                            return schema?.ruleset?.$_terms?.patterns?.[0]?.rule
                        } else {
                            return null;
                        }

                    }
                    schema = newSchema;
                } else if (typeof schema.getItems == 'function') {
                    //@ToDo Need to find a way to select the correct Item if multiple are existing
                    schema = schema.getItems()?.[0];
                    if (!schema) return null;
                }
            }
            return schema;

        }

        get export() {
            return this.latestVersion.data;
        }

        get updateObject() { return this.changeLog }

        get isLoaded() { return this._private.loaded }

        get latestVersion() {
            if (this._private.runningTransaction) return this._private.runningTransaction;
            return this._private.wave[this._private.wave.length - 1]
        }
        get version() { return this.latestVersion ? this.latestVersion.version : undefined }

        get changeLog() { return this.latestVersion.changeLog }

        get ucpComponent() {
            if (!this._private) throw new Error("Component was destroyed");
            return this._private.ucpComponent
        }
        set ucpComponent(ucpComponent) {
            if (Thinglish.isInstanceOf(ucpComponent, UcpComponent)) {
                this._private.ucpComponent = ucpComponent;
            } else {
                throw new Error("Only UcpComponent is allowed to set");
            }
        }

        // get schema() { return this._private.schema}
        // set schema(newSchema) {this._private.schema = newSchema}

        get controller() { return this._private.ucpComponent.controller }
        get id() { return this._private.ucpComponent.id }

        get loaded() { return this._private.loaded; }
        set loaded(value) {
            if (value == false && this._private.loadPromise) {
                this._private.updateDuringLoading = true;
            }
            this._private.loaded = value;
        }

        get fullAccess() { return this._private.fullAccess }
        set fullAccess(newValue) { this._private.fullAccess = newValue; }

        get status() { return this._private.status; }
        set status(value) {
            // @ToDo Need Future Transaction Option
            if (value == UcpModelV2.STATE.AFTER_CHANGE && this._private.status != UcpModelV2.STATE.ON_CHANGE) {
                //   logger.warn("Refactor: Status change not possible! Don't set status");
                return;
            }
            this._private.status = value;
        }

        _addDefaultParameter(data) {
            //@ToDo this should be stored some where else:
            const defaultParameterList = ['_componentConfig', '_componentInfo', '_access'];
            for (const param of defaultParameterList) {
                if (!data[param] && this._private.data[param]) {
                    data[param] = this._private.data[param];
                }
            }
        }

        set model(data) {
            this._addDefaultParameter(data);
            const proxyValue = (data._isModelProxy ? data : this.createDataProxy(data, this, undefined));
            let action = new ParticleSnapshotAction().init({
                to: proxyValue,
                method: ParticleSnapshotAction.METHOD_SET,
                from: this._private.data,
                key: ''
            });
            //this._reportChanges(action);

            this._private.data = proxyValue;
            this._reportChanges(action);
            //if (this._reportChanges(action)) {
            //this._private.data = proxyValue;
            //this._checkForIOR(proxyValue);
            //}
        }

        clearChangeLogElement() {
            //logger.warn("Refactor: The Function clearChangeLogElement is not longer needed in UcpModelV2");
        }

        get model() {
            if (!this._private.data) this._private.data = this.createDataProxy({}, this, undefined);
            //if (!this.isLoaded) this.load();
            return this._private.data;
        }

        set value(data) { this.model = data; }
        get value() { return this.model }

        get json() {
            return this.export;
            //return Thinglish.iorJson(this.model);
        }

        destroy() {
            UcpModelV2.objectStore.remove(this.id);
            this.model._destroy();
            delete this._private.wave;
            let ucpComponent = this._private.ucpComponent;
            delete this._private
            this._private = { ucpComponent };
            delete this.model;

        }

        viewToJson(view) {
            return JSON.stringify(this.serialize(view));
        }

        get data2Store() {

            // Change the mode so no IOR will try to load
            const oldLoadingMode = this.loadingMode;
            if (oldLoadingMode === UcpModelV2.LOADING_MODE.ON_ACCESS) {
                this.loadingMode = UcpModelV2.LOADING_MODE.ON_LOAD;
                if (!this.schema) return this.model;
                let resultData = this.deepCopy(this.model, undefined, this.schema, true);
                this.loadingMode = oldLoadingMode;
                return resultData;

            } else {
                if (!this.schema) return this.model;
                return this.deepCopy(this.model, undefined, this.schema, true);
            }

        }

        toIORStructure(particleSnapshot) {
            let modelData
            if (particleSnapshot) {
                if (this.schema) {
                    modelData = this.deepCopy(particleSnapshot.data, undefined, this.schema, true);
                } else {
                    modelData = particleSnapshot.data;
                }
            } else {
                modelData = this.data2Store;
            }

            return {
                'data': Thinglish.serialize2IORDataStructure(modelData),
                'version': this.version,
                'predecessorVersion': [this.latestVersion.predecessorVersion]
            };
        }


        async importIORChangeNotification(notification) {
            if (!notification.version) throw new Error("Parameter 'version' not provided! No import possible");
            if (!notification.time) throw new Error("Parameter 'time' not provided! No import possible");
            if (!notification.changeLog) throw new Error("Parameter 'changeLog' not provided! No import possible");
            if (typeof notification.predecessorVersion == "undefined") throw new Error("Parameter 'predecessorVersion' not provided! No import possible");


            // @ToDo need a good merging method at this point. 
            if (this.latestVersion.version !== notification.predecessorVersion) {
                logger.log("The predecessor Version doesn't match the ucpModel version!", this.latestVersion, notification);
                if (notification.time > this.latestVersion.time) {
                    logger.warn("Import Notification anyway because the notification is further ahead!");
                } else {
                    throw new Error(`Version Conflict! expect Version ${this.latestVersion.version} but got ${notification.predecessorVersion}. Time is also not ok ${notification.time} > ${this.latestVersion.time}`);
                }
            }

            // @ToDo Check if open Transaction and wait for it to complete
            this.startTransaction({ version: notification.version, predecessorVersion: notification.predecessorVersion, time: notification.time, creatingInstance: notification.creatingInstance });
            let importResult = this._importChangeLog(notification.changeLog, '');
            let result = await this.processTransaction();
            return { importResult: importResult, transactionResult: result };
        }

        _importChangeLog(data2Import, path = []) {
            let importResult = [];
            for (const key of Object.keys(data2Import)) {
                let value = data2Import[key];
                // @ToDo Need a better way to do that
                if (typeof value.time !== 'undefined' && typeof value.key !== 'undefined' && typeof value.method !== 'undefined') {
                    let keyPath = [...path, key];
                    let writeAccess = this.ucpComponent.ucpModel.validateAccess(keyPath, 'writeAccess');
                    if (writeAccess) {
                        let action = new ParticleSnapshotAction().init({
                            to: value.to,
                            method: value.method,
                            from: value.from,
                            time: value.time,
                            key: keyPath.join('.'),
                        });
                        //this._reportChanges(action);

                        const targetPath = 'model' + (action.key !== '' ? '.' : '') + action.key + (action.method == ParticleSnapshotAction.METHOD_DELETE ? '#DELETE' : '');
                        Thinglish.setInObject(this, targetPath, action.to, true);


                    } else {
                        importResult.push(`Ignore KEY ${keyPath.join('.')}. Missing write access!`);
                    }
                } else {
                    importResult = [...importResult, ...this._importChangeLog(data2Import[key], [...path, key])];
                }
            }
            return importResult;
        }

        importIorStructure(iorDataStructure, config) {
            if (!iorDataStructure.version) throw new Error("Parameter 'version' not provided! No import possible");
            if (!iorDataStructure.data) throw new Error("Parameter 'data' not provided! No import possible");

            this.startTransaction({ version: iorDataStructure.version, predecessorVersion: iorDataStructure.predecessorVersion });

            // require full write access as it is the load of the Model

            this._copyLocalVariables(this.model, iorDataStructure.data);
            if (config && config.fullAccess == true && this.fullAccess == false) {
                this._private.fullAccess = true;
                this.model = iorDataStructure.data;
                this._private.fullAccess = false;
            } else {
                this.model = iorDataStructure.data;
            }


            this.processTransaction();

        }

        _copyLocalVariables(sourceModel, targetModel, targetPath = [], schema = this.schema) {
            for (const key of Object.keys(sourceModel)) {
                const objectSchema = this._getSchema([key], schema);
                if (objectSchema.isLocalOnly && objectSchema.isLocalOnly() && typeof sourceModel[key] !== 'undefined') {
                    Thinglish.setInObject(targetModel, [...targetPath, key].join('.'), sourceModel[key], true);
                } else if (objectSchema.type === 'Object') {
                    this._copyLocalVariables(sourceModel[key], targetModel, [...targetPath, key], objectSchema);
                }
            }
        }

        serialize(object) {
            let ior = null;
            if (!object) {
                ior = this.ucpComponent.IOR.queryParameters;
                ior.url = this.ucpComponent.IOR.url;

                object = this.ucpComponent;
            } else {
                ior = object.IOR.queryParameters;
            }
            let valueObject = Thinglish.initRecursion(0, this._serialize, object);
            if (typeof valueObject === "object")
                valueObject.ior = ior;
            Thinglish.cleanupRecursion();
            return valueObject;
        }

        _serialize(object) {
            let valueObject = {};
            let ucpComponent = null;
            let ucpView = null;

            if (object instanceof UcpComponent) {
                ucpComponent = object;
                if (ucpComponent.serialize instanceof Function)
                    return object.serialize();

                valueObject.ior = object.IOR.queryParameters;
                valueObject.ior.url = object.IOR.url;

                object = object.ucpModel.model;
            }
            if (object instanceof UcpView) {
                ucpView = object;
                if (ucpView.ucpComponent.serialize instanceof Function)
                    return object.ucpComponent.serialize();

                valueObject.ior = object.ucpComponent.IOR.queryParameters;
                valueObject.ior.url = object.ucpComponent.IOR.url;
                valueObject.ior.viewClassName = object.type.class.name;
                valueObject.ior.viewId = object.viewId;

                object = object.ucpModel.model;
            }

            if (Array.isArray(object))
                valueObject = [];

            //console.log("serialize: ",object);
            if (Thinglish.isClass(object))
                return "Class " + object.name;
            Object.keys(object).forEach(key => {
                if (["ucpComponent"].indexOf(key) !== -1 || key.startsWith("_"))
                    return;
                let currentValue = object[key];
                //console.log(" serialize:",key," value:",currentValue);

                if (Thinglish.isPrimitive(currentValue)) {
                    valueObject[key] = currentValue;
                } else {
                    let current = ucpComponent || ucpView || object;
                    let result = Thinglish.recursion(current, currentValue);
                    if (result === Infinity) {
                        //console.warn("Infinity detected");
                        if (Thinglish._private.currentRecursion.infiniteObject.IOR)
                            result = Thinglish._private.currentRecursion.infiniteObject.IOR.queryParameters;
                        else {
                            result = "undefined result";
                            //console.log("undefined result for ",Thinglish._private.currentRecursion.infiniteObject);
                        }
                    }
                    valueObject[key] = result;
                }
            });
            return valueObject;
        }

    }
);





var ParticleSnapshot = Namespace.declare(null,
    class ParticleSnapshot extends Thing {
        static get implements() {
            return [];
        }

        constructor() {
            super();
            this._private.isInitialized = false;
            this.collection = null;
        }

        init(config) {
            this.version = config.version;
            this.time = (ONCE.now ? ONCE.now() : ONCE.global.performance.now());
            this.predecessorVersion = config.predecessorVersion;
            this.ucpModel = config.ucpModel;
            this.data = {};
            this._private = {
                transaction: [],
                changeLog: {},
                creatingInstance: config.creatingInstance || ONCE.id,
                promiseHandler: Thinglish.createPromise()
            };
            return this;
        }

        get id() {
            return this.version;
        }

        get creatingInstance() {
            return this._private.creatingInstance;
        }

        get promiseHandler() { return this._private.promiseHandler }

        get openChanges() {
            return this._private.transaction.length;

        }

        export() {
            const changeLog = this.ucpModel._filterWithSecurityContext(this._private.changeLog);
            return {
                version: this.version,
                time: this.time,
                predecessorVersion: this.predecessorVersion || null,
                //changeLog: Thinglish.serialize2IORDataStructure(this._private.changeLog)
                changeLog: Thinglish.serialize2IORDataStructure(changeLog),
                creatingInstance: this._private.creatingInstance
            };
        }

        addAction(action) {
            this._private.transaction.push(action);

            //@ToDo May need deepCopyFunction?
            this.addToChangeLog(action);
            //Thinglish.setInObject(this._private, this._addPrefix('changeLog', action.key), action);

            if (action.to && typeof action.to == 'object' && action.to._isModelProxy) {
                action.toClone = this.ucpModel.deepCopy(action.to, undefined, this.ucpModel._getSchema(action.key.split('.')));
            }
            Thinglish.setInObject(this, this._addPrefix('data', action.key) + (action.method == 'delete' ? '#DELETE' : ''), action.toClone || action.to);
            // @ToDo: Add #DELETE Option int setInObject
        }

        addToChangeLog(action) {

            const originalLoadingMode = this.ucpModel._private.loadingMode;
            this.ucpModel._private.loadingMode = UcpModelV2.LOADING_MODE.ON_LOAD;

            const basePath = action.key !== undefined && action.key !== '' ? action.key.split('.') : [];
            const to = action.to;
            const from = action.from;

            const deepChangeLog = (targetData, sourceData, path = []) => {
                for (const [key, value] of Object.entries(targetData)) {

                    const currentPath = path.concat(key)
                    let currentValue = (sourceData !== undefined ? sourceData[key] : undefined); // Thinglish.lookupInObject(this.targetData, joinedPath);
                    if (value && value._isModelProxy) {
                        deepChangeLog(value, currentValue, currentPath);
                    } else {
                        //const joinedPath = currentPath.join('.')
                        if (value === currentValue) continue;
                        let method;
                        if (currentValue == undefined) {
                            method = ParticleSnapshotAction.METHOD_CREATE;
                        } else if (value == undefined) {
                            method = ParticleSnapshotAction.METHOD_DELETE;
                        } else {
                            method = ParticleSnapshotAction.METHOD_SET
                        }

                        let subAction = new ParticleSnapshotAction().init({
                            to: value,
                            key: key,
                            method: method,
                            from: currentValue,
                            time: action.time
                        });

                        const changeLogPath = ['changeLog', ...basePath, ...currentPath].join('.');
                        Thinglish.setInObject(this._private, changeLogPath, subAction, true);
                    }
                }
                // Changelog for the from (Deleted parameter)
                if (sourceData) {
                    Object.keys(sourceData).forEach(key => {
                        if (typeof targetData[key] === 'undefined') {

                            let subAction = new ParticleSnapshotAction().init({
                                to: undefined,
                                key: key,
                                method: ParticleSnapshotAction.METHOD_DELETE,
                                from: sourceData[key],
                                time: action.time
                            });
                            const changeLogPath = ['changeLog', ...basePath, ...path, key].join('.');

                            Thinglish.setInObject(this._private, changeLogPath, subAction, true);
                        }
                    })
                }
            }


            if (to && to._isModelProxy) {
                deepChangeLog(to, from);
            } else {
                Thinglish.setInObject(this._private, this._addPrefix('changeLog', action.key), action, true);
            }

            this.ucpModel._private.loadingMode = originalLoadingMode;

        }


        get changeLog() {
            return this._private.changeLog;
        }

        // @ToDo Replace by real wave
        get updateObject() {
            this._private.changeLog = this._private.changeLog || {};

        }

        _addPrefix(prefix, key) {
            return prefix + (key !== '' ? '.' : '') + key;
        }

        // applyAction(target, mainParam) {
        //   this._private.transaction.forEach(action => {
        //     const targetPath = mainParam + (action.key !== '' ? '.' : '') + action.key + (action.method == ParticleSnapshotAction.METHOD_DELETE ? '#DELETE' : '');
        //     Thinglish.setInObject(target, targetPath, action.to, true);
        //   });
        // }

    });