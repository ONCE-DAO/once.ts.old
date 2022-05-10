import { z } from "zod";
import DefaultIOR from "../2_systems/Things/DefaultIOR.class";
import { UcpModelProxySchema } from "../2_systems/Things/DefaultUcpModel.class";
import RelatedObjectStore from "../2_systems/Things/RelatedObjectStore.class";
import IOR from "../3_services/IOR.interface";
import { JSONProvider } from "../3_services/JSON.interface";
import { OnceMode } from "../3_services/Once.interface";
import RelatedObjectStoreInterface from "../3_services/RelatedObjectStore.interface";
import UcpComponent, { UcpComponentPersistanceManagerHandler } from "../3_services/UcpComponent.interface";
import UcpModel from "../3_services/UcpModel.interface";
import { BasePersistanceManager, PersistanceManagerHandler } from "./BasePersistanceManager.class";
import BaseThing from "./BaseThing.class";

// HACK: ONCE should be there
//if (ONCE && ONCE.mode === OnceMode.NODE_JS) {
await import("../2_systems/Things/FilePersistanceManager.class")
//}

export default abstract class BaseUcpComponent<ModelDataType, ClassInterface> extends BaseThing<ClassInterface> implements UcpComponent<ModelDataType, ClassInterface>, JSONProvider {
    readonly Store: RelatedObjectStoreInterface = new RelatedObjectStore();
    private _persistanceManager: UcpComponentPersistanceManagerHandler | undefined;
    private _IOR: IOR | undefined;
    public abstract ucpModel: UcpModel;

    get persistanceManager(): UcpComponentPersistanceManagerHandler {

        if (this._persistanceManager === undefined) {
            BasePersistanceManager.getPersistenceManager(this);
            this._persistanceManager = new PersistanceManagerHandler(this);
        }
        return this._persistanceManager;
    }
    get IOR(): IOR {
        if (!this._IOR) {
            this._IOR = DefaultIOR.createUdeIor();
        }
        return this._IOR;
    }

    set IOR(newIOR: IOR) {
        this._IOR = newIOR;
    }

    async add(object: any): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    get model(): ModelDataType {
        return this.ucpModel.model;
    }

    set model(value: any) {
        this.ucpModel.model = value;
    }

    get toJSON(): string {
        // TODO If Object is UDE and is persisted the result should the the IOR
        return this.ucpModel.toJSON
    }

    static get modelSchema() {
        return z.object({
            _component: z.object({
                name: z.string()
            }).merge(UcpModelProxySchema)
        })
    }



    static get modelDefaultData() {
        return { _component: { name: this.name } }
    }

    private static _IOR: IOR | undefined;

    static get IOR(): IOR {
        if (!this._IOR) {
            this._IOR = new DefaultIOR();

            // TODO Replace localhost
            let href = 'localhost/' + this.classDescriptor.classPackageString;
            this._IOR.init(href);
        }
        return this._IOR;
    }

    /*
    get IOR(): IOR {
        if (!this._IOR) {
            this._IOR = new DefaultIOR();

            let href = 'localhost:' + this.filename;
            this._IOR.init(href);
        }
        return this._IOR;
    }
    */

}

/*
            age: z.number().optional(),
            inventory: z.object({
                name: z.string().optional(),
                itemId: z.number().optional(),
            }).array().optional()
            */