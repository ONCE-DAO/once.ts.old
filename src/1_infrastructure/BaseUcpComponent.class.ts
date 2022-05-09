import { z } from "zod";
import { UcpModelProxySchema } from "../2_systems/Things/DefaultUcpModel.class";
import RelatedObjectStore from "../2_systems/Things/RelatedObjectStore.class";
import IOR from "../3_services/IOR.interface";
import { JSONProvider } from "../3_services/JSON.interface";
import RelatedObjectStoreInterface from "../3_services/RelatedObjectStore.interface";
import StoreInterface from "../3_services/Store.interface";
import UcpComponent, { UcpComponentPersistanceManagerHandler } from "../3_services/UcpComponent.interface";
import UcpModel from "../3_services/UcpModel.interface";
import { BasePersistanceManager, PersistanceManagerHandler } from "./BasePersistanceManager.class";
import BaseThing from "./BaseThing.class";

export default abstract class BaseUcpComponent<ModelDataType, ClassInterface> extends BaseThing<ClassInterface> implements UcpComponent<ModelDataType, ClassInterface>, JSONProvider {
    readonly Store: RelatedObjectStoreInterface = new RelatedObjectStore();
    private _persistanceManager: UcpComponentPersistanceManagerHandler | undefined;

    get persistanceManager(): UcpComponentPersistanceManagerHandler {
        if (this._persistanceManager === undefined) {
            BasePersistanceManager.getPersistenceManager(this);
            this._persistanceManager = new PersistanceManagerHandler(this);
        }
        return this._persistanceManager;
    }


    IOR: IOR | undefined;
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

    protected abstract ucpModel: UcpModel;


    static get modelDefaultData() {
        return { _component: { name: this.name } }
    }


}

/*
            age: z.number().optional(),
            inventory: z.object({
                name: z.string().optional(),
                itemId: z.number().optional(),
            }).array().optional()
            */