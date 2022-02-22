import { z } from "zod";
import BaseThing from "../../1_infrastructure/BaseThing.class";
import EventService, { EventServiceConsumer } from "../../3_services/EventService.interface";
import UcpComponent from "../../3_services/UcpComponent.interface";
import UcpModel, { UcpModelChangelog as UcpModelChangelog, UcpModelChangeLogMethods, UcpModelEvents, UcpModelTransactionStates, Wave } from "../../3_services/UcpModel.interface";
import ExtendedPromise from "../JSExtensions/Promise";
import UUiD from "../JSExtensions/UUiD.class";
import DefaultEventService from "./DefaultEventService.class";
import DefaultIOR from "./DefaultIOR.class";

export const UcpModelProxySchema = z.object({
    _helper: z.object({
        changelog: z.any(), // TODO Replace with Changelog interface
        validate: z.function().args(z.string(), z.any()).returns(z.object({ success: z.boolean(), data: z.any().optional(), error: z.any() })),
        multiSet: z.function(),
        _proxyTools: z.object({
            loadIOR: z.function(),
            destroy: z.function().returns(z.void()),
            isProxy: z.boolean(),
            myUcpModel: z.any()
        })
    }).optional()
});

class DefaultUcpModelChangeLog implements UcpModelChangelog {
    [key: string]: UcpModelChangelog | Wave;

}


function getSchemaBottom(schema: any): any {
    if (schema._def.innerType) {
        return getSchemaBottom(schema._def.innerType);
    }
    return schema;
}


type UcpModelSchemaConverterOptions = { optional: boolean }
export function UcpModelSchemaConverter<T>(schema: T, options: UcpModelSchemaConverterOptions): T {
    let schemaBottom = getSchemaBottom(schema);
    let type = schemaBottom._def.typeName

    if (type === 'ZodObject') {
        // //@ts-ignore
        // if (!schema.shape) return schema;
        // //@ts-ignore
        // for (let [key, element] of Object.entries(schema.shape)) {
        //     //@ts-ignore
        //     schema.setKey(key, UcpModelSchemaConverter(element, options));
        // }
        const extendSchema = options?.optional ? UcpModelProxySchema.optional() : UcpModelProxySchema;
        //@ts-ignore
        schema = schema.merge(extendSchema);
    }

    return schema;
}


class DefaultWave implements Wave {
    from: any;
    to: any;
    key: string[];
    method: UcpModelChangeLogMethods;
    time: number;
    id: string;

    constructor(key: string[], from: any, to: any, method: UcpModelChangeLogMethods, time?: number, id?: string) {
        this.key = key;
        this.from = from;
        this.to = to;
        this.method = method;
        this.time = time || Date.now();
        this.id = id || UUiD.uuidv4();
    }
}

class DefaultParticle implements Particle {
    id: string;
    predecessorId: string | undefined;
    snapshot: any;

    constructor(id?: string) {
        this.id = id || UUiD.uuidv4();
    }
    readonly waveList: Wave[] = [];
    public readonly changelog: UcpModelChangelog = new DefaultUcpModelChangeLog();

    addChange(WaveItem: Wave): void {
        this.waveList.push(WaveItem);
        this.add2ChangeLog(WaveItem);
    }

    private add2ChangeLog(WaveItem: Wave): void {
        let changelog = this.changelog as any;
        for (let i = 0; i < WaveItem.key.length - 1; i++) {
            const subKey = WaveItem.key[i];
            if (!changelog.hasOwnProperty(subKey)) {
                changelog[subKey] = new DefaultUcpModelChangeLog();
            }
            changelog = changelog[subKey];

        }
        this.deepChangeLog(WaveItem.to, WaveItem.from, WaveItem.key, WaveItem.time, changelog);
    }

    private deepChangeLog(targetData: any, originalData: any, path: string[], time: number, upperLevelChangeLog: UcpModelChangelog): UcpModelChangelog | Wave | null {

        if (targetData?._helper?._proxyTools?.isProxy !== true) {
            if (targetData === originalData) return null;
            let method;
            if (originalData == undefined) {
                method = UcpModelChangeLogMethods.create;
            } else if (targetData == undefined) {
                method = UcpModelChangeLogMethods.delete;
            } else {
                method = UcpModelChangeLogMethods.set;
            }

            upperLevelChangeLog[path[path.length - 1]] = new DefaultWave(
                [...path],
                originalData,
                targetData,
                method,
                time
            );
        } else {

            let innerChangeLog: UcpModelChangelog = new DefaultUcpModelChangeLog()
            upperLevelChangeLog[path[path.length - 1]] = innerChangeLog;
            let key: string;
            let value: any;
            for ([key, value] of Object.entries(targetData)) {

                const currentPath = path.concat(key)
                let currentValue = (originalData !== undefined ? originalData[key] : undefined);

                //let newValue: UcpModelChangeLog | UcpModelChangeLogItem | null;
                this.deepChangeLog(value, currentValue, currentPath, time, innerChangeLog);

            }

            // Changelog for the from (Deleted parameter)
            if (originalData) {
                Object.keys(originalData).forEach(key => {
                    if (typeof targetData[key] === 'undefined') {

                        innerChangeLog[key] = new DefaultWave(
                            [...path, key],
                            originalData[key],
                            value,
                            UcpModelChangeLogMethods.delete,
                            time
                        );
                    }
                })
            }
        }

        return upperLevelChangeLog;

    }


}

interface Particle {
    id: string;
    predecessorId: string | undefined;
    changelog: UcpModelChangelog,
    snapshot: any,
    waveList: Wave[],
    addChange(ChangeLog: Wave): void;

}



export default class DefaultUcpModel<ModelDataType> extends BaseThing<UcpModel> implements UcpModel, EventServiceConsumer {
    //@ts-ignore   // Is ignored as it is set in the Constructor but typescript does not understand it
    protected data: ModelDataType;
    protected _ucpComponent: UcpComponent<ModelDataType, any>
    protected _transactionState: UcpModelTransactionStates = UcpModelTransactionStates.TRANSACTION_CLOSED;
    protected _history: Particle[] = [];


    constructor(defaultData: any, ucpComponent: UcpComponent<ModelDataType, any>) {
        super();
        this._ucpComponent = ucpComponent;
        this.model = defaultData;
    }
    get eventSupport(): EventService { return DefaultEventService.getSingleton() }

    protected _createProxy4Data(originalData: any, parent: any, proxyPath: string[] = []) {
        const ucpModel = this;
        let createMode = true;

        const schema = ucpModel.getSchema(proxyPath);

        if (!schema) {
            throw new Error(`Missing the schema for the path ${proxyPath.join('.')}`);
        }

        let type = getSchemaBottom(schema)._def.typeName;

        let dataStructure: any;
        switch (type) {
            case 'ZodBoolean':
            case 'ZodNumber':
            case 'ZodString':
                return originalData;
            case 'ZodObject':
                dataStructure = {};
                break;
            case 'ZodArray':
                dataStructure = [];
                break;
            // case 'ZodMap':
            //     dataStructure = new Map();
            //     break;
            default:
                throw new Error(`Type ${type} is not implemented`)
        }

        if (typeof originalData !== 'object') throw new Error(`Type ${type} expected. Got ${typeof originalData}`)

        //let dataStructure: { [index: string]: any } = (type === 'ZodArray' ? [] : {});

        dataStructure._helper = {
            validate(key: string, value: any): z.SafeParseReturnType<any, any> {
                const parameterSchema = ucpModel.getSchema([key], schema)
                if (!parameterSchema) {
                    throw new Error(`Key "${key}" is not defined in the schema`);
                }

                return parameterSchema.safeParse(value);
            },
            get changelog() { return ucpModel.getChangelog(proxyPath) },
            _proxyTools: {
                isProxy: true,
                myUcpModel: ucpModel,
                destroy: () => {
                    Object.keys(dataStructure).forEach(key => {
                        if (dataStructure[key]?._helper?._proxyTools?.isProxy) {
                            dataStructure[key]?._helper?._proxyTools.destroy();
                        }
                        delete dataStructure[key];
                    });
                }, loadIOR() {
                    throw new Error("Not implemented yet");
                }
            },

        }

        const handler = {
            get: (target: any, key: any): any => {
                if (key == "_isModelProxy") return true;

                //ONCE.addStatistic(`${ucpModel.name}.proxyGet.total`);

                const value = target[key];
                if (value == undefined) return undefined;

                // TODO@BE Change to IOR interface
                if (value instanceof DefaultIOR) {
                    return value.load();
                }

                return value;

            },
            set: (target: any, property: any, value: any, receiver: any): boolean => {

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
                if (value?._helper?._proxyTools?.isProxy === true) {
                    if (value._helper._proxyTools.myUcpModel !== ucpModel) {
                        throw new Error("It is not allowed to put Proxy objects into other Models");
                    }
                    proxyValue = value;
                } else {

                    proxyValue = ucpModel._createProxy4Data(value, receiver, [...proxyPath, property]);
                }

                // If the is still in creation no reports are send
                if (createMode) {
                    target[property] = proxyValue;
                } else {

                    let from: any;
                    let method: UcpModelChangeLogMethods = UcpModelChangeLogMethods.create;

                    if (target.hasOwnProperty(property)) {
                        from = target[property];
                        method = UcpModelChangeLogMethods.set;
                    }

                    let changeObject = new DefaultWave([...proxyPath, property], from, proxyValue, method);


                    //this._checkForIOR(proxyValue);
                    target[property] = proxyValue;

                    ucpModel.registerChange(changeObject)


                }
                return true;
            },
            deleteProperty: (target: any, property: any) => {

                // Dose not exists
                if (!target.hasOwnProperty(property)) return true;

                //@ToDo Check if writeable

                let changeObject = new DefaultWave([...proxyPath, property], target[property], undefined, UcpModelChangeLogMethods.delete);
                ucpModel.registerChange(changeObject)

                if (Array.isArray(target)) {
                    target.splice(property, 1);
                } else {
                    delete target[property];
                }

                return true;
            },
            has: (target: any, prop: any) => {
                if (target[prop] && prop !== '_helper') { return true; }
                return false;
            },
            ownKeys: (target: any) => {
                return Reflect.ownKeys(target).filter(key => key !== '_helper');
            }

        };

        let proxy = new Proxy(dataStructure, handler);

        dataStructure._helper.multiSet = (data2Set: any, forceOverwrite = false) => {
            // let transactionOpen = false;
            // if (ucpModel.status == UcpModelV2.STATE.TRANSACTION_OPEN) {
            //   transactionOpen = true;
            // } else if (!createMode) {
            //   ucpModel.startTransaction();
            // }

            for (const key of Object.keys(data2Set)) {
                if (key === '_helper') return;
                let newValue = data2Set[key];

                if (proxy[key] && typeof proxy[key]._helper?.multiSet === 'function') {
                    proxy[key]._helper.multiSet(newValue, forceOverwrite);
                } else {
                    proxy[key] = newValue;
                }
            };

            if (forceOverwrite) {
                Object.keys(dataStructure).forEach(key => {
                    if (typeof data2Set[key] == "undefined" && key != '_helper') delete proxy[key];
                });
            }

            // if (!transactionOpen && !createMode) return ucpModel.processTransaction();
        };
        proxy._helper.multiSet(originalData);

        createMode = false;
        return proxy;
    }

    protected registerChange(change: Wave): void {
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
        return JSON.parse(JSON.stringify(source))
    }

    processTransaction() {

        let particle = this.latestParticle;

        this.eventSupport.fire(UcpModelEvents.ON_MODEL_WILL_CHANGE, this, this.latestParticle.changelog);
        let schema = this.getSchema();

        let parseResult = schema.safeParse(this.data);
        if (parseResult.success === false) {

            throw parseResult.error;
        }

        this.eventSupport.fire(UcpModelEvents.ON_MODEL_CHANGED, this, this.latestParticle.changelog);

        particle.snapshot = this.deepCopy(this.model);

        this._transactionState = UcpModelTransactionStates.TRANSACTION_CLOSED;

    }

    rollbackTransaction() {
        this._transactionState = UcpModelTransactionStates.TRANSACTION_ROLLBACK;
        this._history.pop();
        this.model = this.latestParticle.snapshot
        this._transactionState = UcpModelTransactionStates.TRANSACTION_CLOSED;
    }


    private get latestParticle(): Particle {
        return this._history.slice(-1)[0];
    }

    protected getSchema(path: string[] = [], schema?: any): any {
        if (!schema) schema = this._ucpComponent.classDescriptor.class.modelSchema;
        for (const element of path) {
            const bottomSchema = getSchemaBottom(schema);
            if (bottomSchema._def.typeName === 'ZodArray') {
                if (Number.isNaN(element)) throw new Error(`Can not Access key ${element} on an Array`);
                schema = bottomSchema.element;
            } else {
                const newSchema = bottomSchema.shape?.[element];
                if (newSchema == undefined) return undefined;
                schema = newSchema;
            }
        }
        return schema;
    }
    get model(): ModelDataType { return this.data }

    // any to add default Values....
    set model(newValue: ModelDataType) {
        this.data = this._createProxy4Data(newValue, this)
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

    get toJson(): string {
        return JSON.stringify(this.data);
    };


}
