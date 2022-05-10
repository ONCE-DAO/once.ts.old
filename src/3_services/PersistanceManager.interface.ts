import Class from "./Class.interface";
import IOR from "./IOR.interface";
import UcpComponent from "./UcpComponent.interface";
import { ModelUDEStructure, UcpModelChangelog } from "./UcpModel.interface";

export default interface PersistanceManager {

  create(): Promise<void>;
  retrieve(ior?: IOR): Promise<UDEObject>;
  update(): Promise<void>;
  delete(): Promise<void>;
  onModelChanged(changeObject: UcpModelChangelog): void;
  onNotification(changeObject: UcpModelChangelog): void;
}

export type UDEObject = ModelUDEStructure & {
  iorId: string,
  type: 'Entity',
  entityIOR: string
  objectIor: string
  time: number
}

// TODO@BE Need to use it
export interface PersistanceManagerStatic<ClassInterface> extends Class<ClassInterface> {
  canHandle(ucpComponent: UcpComponent<any, any>): number;
}
