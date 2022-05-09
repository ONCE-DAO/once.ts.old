import { InterfaceDescriptor } from "../2_systems/Things/DefaultClassDescriptor.class";
import PersistanceManager from "../3_services/PersistanceManager.interface";
import UcpComponent, { UcpComponentPersistanceManagerHandler } from "../3_services/UcpComponent.interface";
import { UcpModelChangelog } from "../3_services/UcpModel.interface";
import BaseThing from "./BaseThing.class";

export enum PM_ACTION { create = "create", retrieve = "retrieve", update = "update", delete = "delete", load = "load" }

export abstract class BasePersistanceManager extends BaseThing<any> implements PersistanceManager {

    abstract create(): void
    abstract retrieve(): void
    abstract update(): void
    abstract delete(): void
    abstract load(): void
    abstract onModelChanged(changeObject: UcpModelChangelog): void
    abstract onNotification(changeObject: UcpModelChangelog): void
    protected ucpComponent: UcpComponent<any, any>;

    static getPersistenceManager(ucpComponent: UcpComponent<any, any>): PersistanceManager | undefined {

        const aInterface = InterfaceDescriptor.getInterfaceByNameHack("PersistanceManager");
        if (!aInterface) {
            throw new Error("fail to find the persistence manager Interface");
        }

        const classList = aInterface.implementations.map(x => {
            return {
                result: (x.class.canHandle ? x.class.canHandle(ucpComponent) : 0) as number,
                aClass: x.class
            }
        }
        );
        const sortedClassList = classList.sort((a, b) => b.result - a.result);

        if (sortedClassList.length > 0 && classList[0].result > 0) {
            return new classList[0].aClass(ucpComponent);
        }
    }

    constructor(ucpComponent: UcpComponent<any, any>) {
        super();
        this.ucpComponent = ucpComponent;
        //TODO Replace Interface
        ucpComponent.Store.register(this);
    }


}

export class PersistanceManagerHandler implements UcpComponentPersistanceManagerHandler {
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
    get list(): PersistanceManager[] {
        const interfaceDescriptor = InterfaceDescriptor.getInterfaceByNameHack("PersistanceManager");
        if (!interfaceDescriptor) return [];
        return this.ucpComponent.Store.lookup(interfaceDescriptor) as PersistanceManager[];
    }

    private async runPMAction(action: PM_ACTION): Promise<any[]> {
        const persistenceManagerList = this.list;
        let resultPromises = [];
        if (persistenceManagerList) {
            for (let pm of persistenceManagerList) {
                resultPromises.push(pm[action]());
            }
        }
        let result = await Promise.all(resultPromises);

        return result;
    }

    constructor(private ucpComponent: UcpComponent<any, any>) {
    }

}
