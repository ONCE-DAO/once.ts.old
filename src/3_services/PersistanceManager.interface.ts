import { InterfaceDescriptor } from "../2_systems/Things/DefaultClassDescriptor.class";
import Class from "./Class.interface";
import IOR from "./IOR.interface";
import { ParticleUDEStructure } from "./Particle.interface";
import UcpComponent from "./UcpComponent.interface";
import { UcpModelChangelog } from "./UcpModel.interface";

export default interface PersistanceManager {
  create(): Promise<void>;
  retrieve(ior?: IOR): Promise<UDEObject>;
  update(): Promise<void>;
  delete(): Promise<void>;
  onModelChanged(changeObject: UcpModelChangelog): Promise<void>;
  onNotification(changeObject: UcpModelChangelog): Promise<void>;

  addAlias(alias: string): Promise<void>;
  removeAlias(alias: string): Promise<void>;

  alias: string[];
}

export const PersistanceManagerID = InterfaceDescriptor.lastDescriptor;


export type UDEObject = {
  id: string,
  alias?: string[],
  instanceIOR: string,
  typeIOR: string,
  particle: ParticleUDEStructure
}

// TODO@BE Need to use it
export interface PersistanceManagerStatic<ClassInterface> extends Class<ClassInterface> {
  canHandle(ucpComponent: UcpComponent<any, any>): number;
}
