import Class from "./Class.interface";
import Thing from "./Thing.interface";

export default interface UcpComponent<ModelDataType> extends Thing<UcpComponent<ModelDataType>> {
    model: ModelDataType,
}

export interface UcpComponentStatics<ModelDataType> extends Class<UcpComponent<ModelDataType>> {
    modelSchema: any
}