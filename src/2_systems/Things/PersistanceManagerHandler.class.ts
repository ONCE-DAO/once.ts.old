import { PM_ACTION } from "../../1_infrastructure/BasePersistanceManager.class";
import PersistanceManager from "../../3_services/PersistanceManager.interface";
import { PersistanceManagerHandler } from "../../3_services/PersistanceManagerHandler.interface";
import UcpComponent from "../../3_services/UcpComponent.interface";
import { InterfaceDescriptor } from "./DefaultClassDescriptor.class";

export class DefaultPersistanceManagerHandler implements PersistanceManagerHandler {
    async create(): Promise<any[]> {
        return this.runPMAction(PM_ACTION.create)
    }
    async retrieve(): Promise<any[]> {
        return this.runPMAction(PM_ACTION.retrieve)
    }
    async update(): Promise<any[]> {
        return this.runPMAction(PM_ACTION.update)
    }
    async delete(): Promise<any[]> {
        return this.runPMAction(PM_ACTION.delete)
    }

    async addAlias(alias: string): Promise<any[]> {
        return this.runPMAction(PM_ACTION.addAlias, alias)

    }
    get list(): PersistanceManager[] {
        const interfaceDescriptor = InterfaceDescriptor.getInterfaceByNameHack("PersistanceManager");
        if (!interfaceDescriptor) return [];
        return this.ucpComponent.Store.lookup(interfaceDescriptor) as PersistanceManager[];
    }

    private async runPMAction(action: PM_ACTION, param1?: any): Promise<any[]> {
        const persistenceManagerList = this.list;
        const resultPromises = [];
        if (persistenceManagerList) {
            for (let pm of persistenceManagerList) {
                if (action === PM_ACTION.addAlias) {
                    resultPromises.push(pm[action](param1));
                } else {
                    resultPromises.push(pm[action]());
                }
            }
        }
        let result = await Promise.all(resultPromises);

        return result;
    }

    constructor(private ucpComponent: UcpComponent<any, any>) {
    }

}