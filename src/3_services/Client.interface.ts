import { InterfaceDescriptor } from "../2_systems/Things/DefaultClassDescriptor.class";
import Class from "./Class.interface";
import IOR from "./IOR.interface";

export default interface Client {
    canConnect(ior: IOR): number;
    init(ior: IOR): Client;

}
export const ClientID = InterfaceDescriptor.lastDescriptor;


export interface ClientStatic extends Class<ClientStatic> {
    factory(ior: IOR): Client;
    canConnect(ior: IOR): number;
}
export const ClientStaticID = InterfaceDescriptor.lastDescriptor;
