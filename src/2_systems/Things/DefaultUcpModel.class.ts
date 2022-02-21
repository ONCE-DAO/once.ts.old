import { z } from "zod";
import UcpComponent from "../../3_services/UcpComponent.interface";
import UcpModel, { UcpModelChangeLog, UcpModelChangeLogItem, UcpModelChangeLogMethods } from "../../3_services/UcpModel.interface";
import ExtendedPromise from "../JSExtensions/Promise";
import DefaultIOR from "./DefaultIOR.class";

type validateResult = { success: true; data: any; } | { success: false; error: z.ZodError; }

export const UcpModelProxySchema = z.object({
    _helper: z.object({
        changeLog: z.object({}),
        validate: z.function().args(z.string(), z.any()).returns(z.object({ success: z.boolean(), data: z.any().optional(), error: z.any() })),
        multiSet: z.function(),
        _proxyTools: z.object({
            loadIOR: z.function(),
            destroy: z.function().returns(z.void()),
            isProxy: z.boolean(),
            myUcpModel: z.any()
        })
    })
});

type schemaSearchResult = typeof z.ZodType;

function getSchemaType(schema: any): string {
    if (schema._def.innerType) {
        return getSchemaType(schema._def.innerType);
    }
    return schema._def.typeName;
}

export const UcpModelSchemaConverter = (schema: any, optional: boolean) => {
    schema;
    if (getSchemaType(schema) !== 'ZodObject') return schema;

    if (!schema.shape) return schema;
    for (let [key, element] of Object.entries(schema.shape)) {
        schema.setKey(key, UcpModelSchemaConverter(element, optional));
    }
    const extendSchema = optional ? UcpModelProxySchema.optional() : UcpModelProxySchema;
    schema = schema.extend(extendSchema);
    return schema;
}

type ucpModelProxy = {
    [index: string]: any
    /* _helper: {
         changeLog: UcpModelChangeLog,
         validate: boolean,
         multiSet: Promise<boolean>
         _proxyTools: {
             loadIOR: Promise<boolean>,
             destroy: void,
             isProxy: boolean,
             myUcpModel: UcpModel
         }
     }*/
}

class DefaultUcpModelChangeLogItem implements UcpModelChangeLogItem {
    to: any;
    key: string[];
    method: UcpModelChangeLogMethods;
    from: any;
    time: Date;

    constructor(to: any, key: string[], method: UcpModelChangeLogMethods, from: any) {
        this.to = to;
        this.key = key;
        this.method = method;
        this.from = from;
        this.time = new Date();
    }


}

export default class DefaultUcpModel<ModelDataType> implements UcpModel {
    protected data: ModelDataType;
    protected _ucpComponent: UcpComponent<ModelDataType, any>


    constructor(defaultData: any, ucpComponent: UcpComponent<ModelDataType, any>) {
        this._ucpComponent = ucpComponent;
        const modelSchema = ucpComponent.classDescriptor.class.modelSchema;
        //@ts-ignore
        this.data = defaultData;
        this.model = defaultData;

    }

    protected _createProxy4Data(originalData: any, parent: any, proxyPath: string[] = []) {
        const ucpModel = this;
        let createMode = true;

        const schema = ucpModel.getSchema(proxyPath);

        if (!schema) throw new Error(`Missing the schema for the path ${proxyPath.join('.')}`);

        let type = getSchemaType(schema);

        switch (type) {
            case 'ZodBoolean':
            case 'ZodNumber':
            case 'ZodString':
                return originalData;
            case 'ZodObject':
            case 'ZodArray':
                break;
            default:
                throw new Error(`Type ${type} is not implemented`)
        }


        let dataStructure: ucpModelProxy = (type === 'ZodArray' ? [] : {});

        dataStructure._helper = {
            validate(key: string, value: any): z.SafeParseReturnType<any, any> {
                const parameterSchema = ucpModel.getSchema([key], schema)
                if (!parameterSchema) {
                    throw new Error(`Key "${key}" is not defined in the schema`);
                }

                return parameterSchema.safeParse(value);
            },
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

                    let action = new DefaultUcpModelChangeLogItem(proxyValue, [...proxyPath, property], from, method);


                    //this._checkForIOR(proxyValue);
                    target[property] = proxyValue;

                    //parent._reportChanges(action)


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

            Object.keys(data2Set).forEach(key => {
                if (key === '_helper') return;
                let newValue = data2Set[key];

                if (proxy[key] && typeof proxy[key]._helper?.multiSet === 'function') {
                    proxy[key]._helper.multiSet(newValue, forceOverwrite);
                } else {
                    proxy[key] = newValue;
                }
            });

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


    protected getSchema(path: string[] = [], schema?: any): any {
        if (!schema) schema = this._ucpComponent.classDescriptor.class.modelSchema;
        for (const element of path) {
            const newSchema = schema.shape[element];
            if (newSchema == undefined) return undefined;
            schema = newSchema;
        }
        return schema;
    }
    get model(): ModelDataType { return this.data }

    // any to add default Values....
    set model(newValue: ModelDataType) {
        this.data = this._createProxy4Data(newValue, this)
    }


    destroy(): void {
        throw new Error("Method not implemented.");
    }
    get changeLog(): UcpModelChangeLog {
        throw new Error("Not implemented yet");
    };
    get toJson(): string {
        throw new Error("Not implemented yet");
    };
}
