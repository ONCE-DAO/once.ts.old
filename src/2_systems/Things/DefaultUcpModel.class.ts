import { z } from "zod";
import BaseThing from "../../1_infrastructure/BaseThing.class";
import EventService, { EventServiceConsumer } from "../../3_services/EventService.interface";
import Particle from "../../3_services/Particle.interface";
import UcpComponent from "../../3_services/UcpComponent.interface";
import UcpModel, { UcpModelChangelog as UcpModelChangelog, UcpModelChangeLogMethods, UcpModelEvents, UcpModelTransactionStates } from "../../3_services/UcpModel.interface";
import Wave from "../../3_services/Wave.interface";
import ExtendedPromise from "../JSExtensions/Promise";
import DefaultEventService from "./DefaultEventService.class";
import DefaultIOR from "./DefaultIOR.class";
import DefaultParticle from "./DefaultParticle.class";
import DefaultWave from "./DefaultWave.class";


export const UcpModelProxySchema = z.object({
    _helper: z.object({
        changelog: z.any(), // TODO Replace with Changelog interface
        validate: z.function().args(z.string(), z.any()).returns(z.object({ success: z.boolean(), data: z.any().optional(), error: z.any() })),
        multiSet: z.function(),
        _proxyTools: z.object({
            loadIOR: z.function(),
            destroy: z.function().returns(z.void()),
            isProxy: z.boolean(),
            myUcpModel: z.any(),
            createMode: z.boolean(),
            proxyPath: z.string().array(),
            schema: z.any()
        })
    }).optional()
});

const iorSchema = z.object({ load: z.function().args(z.any()), href: z.string() });
export const UcpModelProxyIORSchema = z.union([z.string(), iorSchema, z.object({ IOR: iorSchema })]).describe("IOR Object")

type internalIOR = z.infer<typeof UcpModelProxyIORSchema>


//type UcpModelSchemaConverterOptions = { optional: boolean }
// export function UcpModelSchemaConverter<T>(schema: T, options: UcpModelSchemaConverterOptions): T {
//     let schemaBottom = getSchemaBottom(schema);
//     let type = schemaBottom._def.typeName
//     if (type === 'ZodObject') {
//         // //@ts-ignore
//         // if (!schema.shape) return schema;
//         // //@ts-ignore
//         // for (let [key, element] of Object.entries(schema.shape)) {
//         //     //@ts-ignore
//         //     schema.setKey(key, UcpModelSchemaConverter(element, options));
//         // }
//         const extendSchema = options?.optional ? UcpModelProxySchema.optional() : UcpModelProxySchema;
//         //@ts-ignore
//         schema = schema.merge(extendSchema);
//     }
//     return schema;
// }

export class DefaultUcpModelChangeLog implements UcpModelChangelog {
    [key: string]: UcpModelChangelog | Wave;

}


function getSchemaBottom(schema: any): any {
    if (schema._def.innerType) {
        return getSchemaBottom(schema._def.innerType);
    }
    return schema;
}


class UcpModelMapProxy extends Map {
    _helper: any;
    private _getKey4Any(key: any): any {
        const schema = getSchemaBottom(this._helper._proxyTools.schema);
        const keySchema = schema._def.keyType;
        if (keySchema.description === 'IOR Object') {

            if (typeof key == 'object') {
                if (key instanceof DefaultIOR) {
                    return key.href;
                }
                if (key.IOR && key.IOR instanceof DefaultIOR) {
                    return key.IOR.href;
                }
            }
            if (typeof key === 'string' && key.startsWith('ior:')) {
                return key;
            }
            throw new Error("Not an IOR Object " + key)
        } else {
            return key;
        }
    }

    clear() {
        const proxyTools = this._helper._proxyTools;
        const ucpModel = proxyTools.myUcpModel as DefaultUcpModel<any>;

        let startedTransaction = false;
        if (ucpModel.transactionState === UcpModelTransactionStates.TRANSACTION_CLOSED) {
            startedTransaction = true;
            ucpModel.startTransaction();
        }

        for (const [key, value] of this) {
            const wave = new DefaultWave([...proxyTools.proxyPath, key], value, undefined, UcpModelChangeLogMethods.delete);
            ucpModel._registerChange(wave);
        }

        if (startedTransaction) {
            ucpModel.processTransaction();
        }

        return super.clear();
    }
    set(key: any, value: any) {

        const proxyTools = this._helper._proxyTools;
        const ucpModel = proxyTools.myUcpModel as DefaultUcpModel<any>;
        let proxyValue;
        if (ucpModel._isProxyObject(value)) {
            proxyValue = value;
        } else {
            proxyValue = ucpModel._createProxy4Data(value, [...proxyTools.proxyPath, key]);
        }

        let internalKey = this._getKey4Any(key)


        // If the is still in creation no reports are send
        if (this._helper._proxyTools.createMode) {
            return super.set(internalKey, proxyValue);
        } else {

            let from: any;
            let method: UcpModelChangeLogMethods = UcpModelChangeLogMethods.create;

            if (this.has(internalKey)) {
                from = this.get(internalKey);
                method = UcpModelChangeLogMethods.set;
            }

            const wave = new DefaultWave([...proxyTools.proxyPath, internalKey], from, proxyValue, method);


            const result = super.set(internalKey, proxyValue);


            ucpModel._registerChange(wave)
            return result;

        }
    }

    delete(key: any) {

        let internalKey = this._getKey4Any(key)


        // Dose not exists
        if (!this.has(internalKey)) return true;

        const proxyTools = this._helper._proxyTools;
        const ucpModel = proxyTools.myUcpModel as DefaultUcpModel<any>;



        //@ToDo Check if writeable

        const wave = new DefaultWave([...proxyTools.proxyPath, internalKey], this.get(internalKey), undefined, UcpModelChangeLogMethods.delete);
        ucpModel._registerChange(wave)


        return super.delete(internalKey);
    }
    entries() {
        return super.entries();
    }
    get(key: any) {
        let internalKey = this._getKey4Any(key)

        return super.get(internalKey);
    }


}
class UcpModelObjectProxy {
    _helper: any;
}

class UcpModelArrayProxy extends Array {
    _helper: any;
}

export default class DefaultUcpModel<ModelDataType> extends BaseThing<UcpModel> implements UcpModel, EventServiceConsumer {
    //@ts-ignore   // Is ignored as it is set in the Constructor but typescript does not understand it
    protected data: ModelDataType;
    protected _ucpComponent: UcpComponent<ModelDataType, any>
    protected _transactionState: UcpModelTransactionStates = UcpModelTransactionStates.TRANSACTION_CLOSED;
    protected _history: Particle[] = [];

    public loadOnAccess: boolean = true;

    constructor(defaultData: any, ucpComponent: UcpComponent<ModelDataType, any>) {
        super();
        this._ucpComponent = ucpComponent;
        this.model = defaultData;
    }
    EVENTS: any;

    get toJSON(): string {
        let loadOnAccess = this.loadOnAccess;
        this.loadOnAccess = false;
        let result = JSON.stringify(this.deepCopy(this.model))
        this.loadOnAccess = loadOnAccess;
        return result;
    }

    get eventSupport(): EventService { return DefaultEventService.getSingleton() }

    public _createProxy4Data(originalData: any, proxyPath: string[] = []) {

        const schema = this.getSchema(proxyPath);

        if (!schema) {
            throw new Error(`Missing the schema for the path ${proxyPath.join('.')}`);
        }


        const bottomSchema = getSchemaBottom(schema);
        let type = bottomSchema._def.typeName;

        let dataStructure: any;
        let requireProxy = true;
        switch (type) {
            case 'ZodBoolean':
            case 'ZodNumber':
            case 'ZodString':
                return originalData;
            case 'ZodObject':
                dataStructure = new UcpModelObjectProxy();
                break;
            case 'ZodArray':
                dataStructure = new UcpModelArrayProxy();
                break;
            case 'ZodMap':
                dataStructure = new UcpModelMapProxy();
                requireProxy = false;
                break;
            case 'ZodUnion':
                if (bottomSchema.description === 'IOR Object') {
                    if (typeof originalData === 'string') {
                        return new DefaultIOR().init(originalData);
                    }
                    return originalData;
                }
            default:
                throw new Error(`Type ${type} is not implemented`)
        }

        if (typeof originalData !== 'object') throw new Error(`Type ${type} expected. Got a ${typeof originalData}`)

        let proxyObject: any;
        const handlerConfig = { proxyPath: proxyPath, createMode: true };
        if (requireProxy) {
            const handler = this.proxyHandlerFactory(handlerConfig);
            proxyObject = new Proxy(dataStructure, handler);
        } else {
            proxyObject = dataStructure;
        }

        const helperConfig = { proxyPath, innerDataStructure: dataStructure, proxyObject, schema, createMode: true }
        dataStructure._helper = this.proxyHelperFactory(helperConfig);

        proxyObject._helper.multiSet(originalData);

        handlerConfig.createMode = false;
        helperConfig.createMode = false;
        return proxyObject;
    }

    public _registerChange(change: Wave): void {
        const state = this._transactionState;
        switch (state) {
            case UcpModelTransactionStates.TRANSACTION_CLOSED:
                this.startTransaction();
                if (!this.latestParticle) throw new Error("Missing Particle");
                this.latestParticle.addChange(change);
                this.processTransaction();
                break;
            case UcpModelTransactionStates.TRANSACTION_ROLLBACK:
                // Nothing to do in this state
                break;
            case UcpModelTransactionStates.TRANSACTION_OPEN:
                this.latestParticle.addChange(change);
                break;

            default:
                throw new Error("Not implemented yet " + state);

        }
    }

    startTransaction(): void {
        if (this.transactionState === UcpModelTransactionStates.TRANSACTION_CLOSED) {
            let particle = new DefaultParticle();

            particle.predecessorId = this._history[this._history.length - 1]?.id;
            this._history.push(particle);
            this._transactionState = UcpModelTransactionStates.TRANSACTION_OPEN;
        } else {
            throw new Error(`Transaction in wrong state: ${this.transactionState}`);
        }
    }

    private deepCopy(source: any): any {
        if (source === undefined) return undefined;
        return JSON.parse(JSON.stringify(source, (key, value) => {
            if (key === '_helper') return undefined

            if (value instanceof UcpModelMapProxy) return [...value]
            if (value instanceof Map) return [...value]

            const toJSON = value?.toJSON || value?.IOR?.toJSON;
            if (typeof toJSON !== 'undefined') return toJSON

            return value;
        }))
    }

    processTransaction() {

        let particle = this.latestParticle;

        this._transactionState = UcpModelTransactionStates.BEFORE_CHANGE;


        this.eventSupport.fire(UcpModelEvents.ON_MODEL_WILL_CHANGE, this, this.latestParticle.changelog);
        let schema = this.getSchema();

        let parseResult = schema.safeParse(this.data);
        if (parseResult.success === false) {

            throw parseResult.error;
        }

        this._transactionState = UcpModelTransactionStates.AFTER_CHANGE;


        this.eventSupport.fire(UcpModelEvents.ON_MODEL_CHANGED, this, this.latestParticle.changelog);

        particle.snapshot = this.deepCopy(this.model);

        this._transactionState = UcpModelTransactionStates.TRANSACTION_CLOSED;

    }

    rollbackTransaction() {
        this._transactionState = UcpModelTransactionStates.TRANSACTION_ROLLBACK;
        this._history.pop();
        //@ts-ignore
        this.model._helper._proxyTools.destroy();
        this.model = this.latestParticle.snapshot
        this._transactionState = UcpModelTransactionStates.TRANSACTION_CLOSED;
    }


    private get latestParticle(): Particle {
        return this._history.slice(-1)[0];
    }

    public getSchema(path: string[] = [], schema?: any): any {
        if (!schema) schema = this._ucpComponent.classDescriptor.class.modelSchema;
        for (const element of path) {
            const bottomSchema = getSchemaBottom(schema);
            switch (bottomSchema._def.typeName) {
                case 'ZodObject':
                    const newSchema = bottomSchema.shape?.[element];
                    if (newSchema == undefined) return undefined;
                    schema = newSchema;
                    break;
                case 'ZodArray':
                    if (Number.isNaN(element)) throw new Error(`Can not Access key ${element} on an Array`);
                    schema = bottomSchema.element;
                    break;
                case 'ZodMap':
                    schema = bottomSchema._def.valueType;
                    break;
                default:
                    throw new Error(`Unknown type ${bottomSchema._def.typeName} to find the schema`)

            }

        }
        return schema;
    }
    get model(): ModelDataType { return this.data }

    // any to add default Values....
    set model(newValue: ModelDataType) {
        const proxy = this._createProxy4Data(newValue);

        const wave = new DefaultWave([], this.data, proxy, (this.data ? UcpModelChangeLogMethods.set : UcpModelChangeLogMethods.create));

        this.data = proxy;
        this._registerChange(wave);
    }

    get transactionState() {
        return this._transactionState;
    }


    destroy(): void {
        //@ts-ignore
        this.model._helper._proxyTools.destroy();
        //@ts-ignore
        delete this.data;
        //@ts-ignore
        delete this._history;
        super.destroy();
    }


    get changelog(): any { // TODO sollte UcpModelChangeLog | undefined sein. Aber das funktioniert nicht
        return this.latestParticle.changelog;
    };

    getChangelog(path: string[] = []): UcpModelChangelog | undefined {
        let changelog = this.latestParticle.changelog;
        for (const key of path) {
            if (changelog.hasOwnProperty(key)) {
                //@ts-ignore
                changelog = changelog[key];
            } else {
                return undefined;
            }
        }
        return changelog;

    }

    private proxyHelperFactory(config: { proxyPath: string[], innerDataStructure: any, proxyObject: any, schema: any, createMode: boolean }) {
        const ucpModel = this;
        return {
            validate(key: string, value: any): z.SafeParseReturnType<any, any> {
                const parameterSchema = ucpModel.getSchema([key], config.schema)
                if (!parameterSchema) {
                    throw new Error(`Key "${key}" is not defined in the schema`);
                }

                return parameterSchema.safeParse(value);
            },
            get changelog() { return ucpModel.getChangelog(config.proxyPath) },
            _proxyTools: {
                isProxy: true,
                get myUcpModel() { return ucpModel },
                destroy: () => {
                    Object.keys(config.innerDataStructure).forEach(key => {
                        if (ucpModel._isProxyObject(config.innerDataStructure[key]) === true) {
                            config.innerDataStructure[key]?._helper?._proxyTools.destroy();
                        }
                        delete config.innerDataStructure[key];
                    });
                }, loadIOR() {
                    throw new Error("Not implemented yet");
                },
                get createMode() { return config.createMode },
                get proxyPath() { return config.proxyPath },
                get schema() { return config.schema }
            },
            multiSet(data2Set: any, forceOverwrite: boolean = false) {
                let transactionOpen = false;
                if (ucpModel.transactionState === UcpModelTransactionStates.TRANSACTION_OPEN) {
                    transactionOpen = true;
                } else if (!config.createMode) {
                    ucpModel.startTransaction();
                }

                if (config.proxyObject instanceof UcpModelMapProxy) {
                    for (const [key, value] of data2Set) {
                        config.proxyObject.set(key, value);
                    }
                } else {


                    for (const key of Object.keys(data2Set)) {
                        if (key === '_helper') return;
                        let newValue = data2Set[key];

                        if (config.proxyObject[key] && typeof config.proxyObject[key]._helper?.multiSet === 'function') {
                            config.proxyObject[key]._helper.multiSet(newValue, forceOverwrite);
                        } else {
                            config.proxyObject[key] = newValue;
                        }
                    };

                    if (forceOverwrite) {
                        Object.keys(config.innerDataStructure).forEach(key => {
                            if (typeof data2Set[key] == "undefined" && key != '_helper') delete config.proxyObject[key];
                        });
                    }
                }

                if (!transactionOpen && !config.createMode) ucpModel.processTransaction();
            }

        }
    }

    private _proxyGet(target: any, key: any) {
        const value = target[key];
        if (value == undefined) return undefined;

        // TODO@BE Change to runtime interface
        if (value instanceof DefaultIOR) {
            if ([UcpModelTransactionStates.TRANSACTION_CLOSED, UcpModelTransactionStates.TRANSACTION_OPEN].includes(this._transactionState) && this.loadOnAccess === true) {
                return value.load();
            }
        }

        return value;
    }

    public _isProxyObject(object: any): boolean {
        if (object?._helper?._proxyTools?.isProxy === true) {
            if (object._helper._proxyTools.myUcpModel !== this) {
                throw new Error("It is not allowed to put Proxy objects into other Models");
            }
            return true;
        }
        return false;
    }

    private _proxySet(target: any, property: any, value: any, receiver: any, config: { proxyPath: string[], createMode: boolean }): boolean {
        if (Array.isArray(target) && property === 'length') {
            target[property] = value;
        }

        // Already the same value
        if (value === target[property]) {
            return true;
        }

        // Allow Promises to be written directly to the Model. No Transaction is started
        if (ExtendedPromise.isPromise(value)) {
            const originalValue = target[property];
            target[property] = value;
            value.then((x: any) => {
                receiver[property] = x;
            }
            ).catch((e: any) => {
                target[property] = originalValue;
            });
            return true;
        }

        //@ToDo Check if writeable

        let proxyValue;
        if (this._isProxyObject(value)) {
            proxyValue = value;
        } else {
            proxyValue = this._createProxy4Data(value, [...config.proxyPath, property]);
        }

        // If the is still in creation no reports are send
        if (config.createMode) {
            target[property] = proxyValue;
        } else {

            let from: any;
            let method: UcpModelChangeLogMethods = UcpModelChangeLogMethods.create;

            if (target.hasOwnProperty(property)) {
                from = target[property];
                method = UcpModelChangeLogMethods.set;
            }

            let changeObject = new DefaultWave([...config.proxyPath, property], from, proxyValue, method);


            //this._checkForIOR(proxyValue);
            target[property] = proxyValue;

            this._registerChange(changeObject)


        }
        return true;
    }

    private _proxyDelete(target: any, property: any, config: { proxyPath: string[], createMode: boolean }): boolean {
        // Dose not exists
        if (!target.hasOwnProperty(property)) return true;

        //@ToDo Check if writeable

        let changeObject = new DefaultWave([...config.proxyPath, property], target[property], undefined, UcpModelChangeLogMethods.delete);
        this._registerChange(changeObject)

        if (Array.isArray(target)) {
            target.splice(property, 1);
        } else {
            delete target[property];
        }

        return true;
    }

    private proxyHandlerFactory(config: { proxyPath: string[], createMode: boolean }) {
        const ucpModel = this;
        return {
            get: (target: any, key: any): any => {
                return ucpModel._proxyGet(target, key);
            },
            set: (target: any, property: any, value: any, receiver: any): boolean => {
                return ucpModel._proxySet(target, property, value, receiver, config)
            },
            deleteProperty: (target: any, property: any) => {
                return ucpModel._proxyDelete(target, property, config)

            },
            has: (target: any, prop: any) => {
                if (target[prop] && prop !== '_helper') { return true; }
                return false;
            },
            ownKeys: (target: any) => {
                return Reflect.ownKeys(target).filter(key => key !== '_helper');
            }

        }
    }

}


