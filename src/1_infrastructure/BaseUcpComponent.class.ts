import { z } from "zod";
import DefaultIOR from "../2_systems/Things/DefaultIOR.class";
import { UcpModelProxySchema } from "../2_systems/Things/DefaultUcpModel.class";
import { DefaultPersistanceManagerHandler } from "../2_systems/Things/PersistanceManagerHandler.class";
import RelatedObjectStore from "../2_systems/Things/RelatedObjectStore.class";
import IOR from "../3_services/IOR.interface";
import { JSONProvider } from "../3_services/JSON.interface";
import RelatedObjectStoreInterface from "../3_services/RelatedObjectStore.interface";
import UcpComponent from "../3_services/UcpComponent.interface";
import UcpModel from "../3_services/UcpModel.interface";
import { BasePersistanceManager } from "./BasePersistanceManager.class";
import BaseThing from "./BaseThing.class";

// HACK: ONCE should be there
//if (ONCE && ONCE.mode === OnceMode.NODE_JS) {
await import("../2_systems/Things/FilePersistanceManager.class")
//}

export default abstract class BaseUcpComponent<ModelDataType, ClassInterface> extends BaseThing<ClassInterface> implements UcpComponent<ModelDataType, ClassInterface>, JSONProvider {
    readonly Store: RelatedObjectStoreInterface = new RelatedObjectStore();
    private _persistanceManager: DefaultPersistanceManagerHandler | undefined;
    private _IOR: IOR | undefined;
    public abstract ucpModel: UcpModel;

    get persistanceManager(): DefaultPersistanceManagerHandler {

        if (this._persistanceManager === undefined) {
            BasePersistanceManager.getPersistenceManager(this);
            this._persistanceManager = new DefaultPersistanceManagerHandler(this);
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
            let href = 'ior:esm:git:' + this.classDescriptor.classPackageString;
            this._IOR.init(href);
        }
        return this._IOR;
    }

}
