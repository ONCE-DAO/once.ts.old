import Class from "./Class.interface";
import IOR from "./IOR.interface";
import { PersistanceManagerHandler } from "./PersistanceManagerHandler.interface";
import RelatedObjectStore from "./RelatedObjectStore.interface";
import Thing from "./Thing.interface";
import UcpModel from "./UcpModel.interface";

export default interface UcpComponent<ModelDataType, ClassInterface> extends Thing<ClassInterface> {
    model: ModelDataType;
    add(object: any): Promise<boolean>;
    IOR: IOR;
    persistanceManager: PersistanceManagerHandler;
    Store: RelatedObjectStore;
    ucpModel: UcpModel;
}



export interface UcpComponentStatics<ModelDataType, ClassInterface> extends Class<ClassInterface> {
    modelSchema: any;
    modelDefaultData: ModelDataType;
    IOR: IOR;
}