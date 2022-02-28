import Class from "./Class.interface";
import IOR from "./IOR.interface";
import { JSONProvider } from "./JSON.interface";
import Thing from "./Thing.interface";

export default interface UcpComponent<ModelDataType, ClassInterface> extends Thing<ClassInterface> {
    model: ModelDataType,
    add(object: any): Promise<boolean>
    IOR: IOR | undefined;
}

export interface UcpComponentStatics<ModelDataType, ClassInterface> extends Class<ClassInterface> {
    modelSchema: any;
    modelDefaultData: ModelDataType;
}