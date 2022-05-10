import Class from "./Class.interface";
import IOR from "./IOR.interface";
import PersistanceManager from "./PersistanceManager.interface";
import RelatedObjectStore from "./RelatedObjectStore.interface";
import Thing from "./Thing.interface";
import UcpModel from "./UcpModel.interface";

export default interface UcpComponent<ModelDataType, ClassInterface> extends Thing<ClassInterface> {
    model: ModelDataType;
    add(object: any): Promise<boolean>;
    IOR: IOR;
    persistanceManager: UcpComponentPersistanceManagerHandler;
    Store: RelatedObjectStore;
    ucpModel: UcpModel;
}

export interface UcpComponentPersistanceManagerHandler {
    create(): Promise<any[]>;
    retrieve(): Promise<any[]>;
    update(): Promise<any[]>;
    delete(): Promise<any[]>;
    list: PersistanceManager[];
    // await(): Promise<any[]>;
}

export interface UcpComponentStatics<ModelDataType, ClassInterface> extends Class<ClassInterface> {
    modelSchema: any;
    modelDefaultData: ModelDataType;
    IOR: IOR;
}