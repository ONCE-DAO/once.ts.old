import Class from "./Class.interface";
import UcpComponent from "./UcpComponent.interface";
import { UcpModelChangelog } from "./UcpModel.interface";

export default interface PersistanceManager {

  create(): void;
  retrieve(): void;
  update(): void;
  delete(): void;
  load(): void;
  onModelChanged(changeObject: UcpModelChangelog): void;
  onNotification(changeObject: UcpModelChangelog): void;
}

// TODO@BE Need to use it
export interface PersistanceManagerStatic<ClassInterface> extends Class<ClassInterface> {
  canHandle(ucpComponent: UcpComponent<any, any>): number;
}
