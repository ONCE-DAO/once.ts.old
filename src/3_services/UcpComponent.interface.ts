import Class from "./Class.interface";
import Thing from "./Thing.interface";

export default interface UcpComponent extends Thing<UcpComponent> {
    model: any,
}

export interface UcpComponentStatics extends Class<UcpComponent> {
    modelSchema: any
}