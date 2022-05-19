import { InterfaceDescriptor } from "../2_systems/Things/DefaultClassDescriptor.class";
import Client from "./Client.interface";
import { HttpResponse } from "./CRUDClient.interface";
import IOR from "./IOR.interface";



export default interface REST_Client extends Client {
  POST(ior: IOR, data?: any): Promise<HttpResponse>
  GET(ior: IOR): Promise<HttpResponse>
  PUT(ior: IOR, data?: any): Promise<HttpResponse>
  DELETE(ior: IOR): Promise<HttpResponse>
}
export const REST_ClientID = InterfaceDescriptor.lastDescriptor 
