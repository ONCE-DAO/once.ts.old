import { InterfaceDescriptor } from "../2_systems/Things/DefaultClassDescriptor.class";
import IOR from "../3_services/IOR.interface";
import PersistanceManager, { UDEObject } from "../3_services/PersistanceManager.interface";
import UcpComponent, { UcpComponentPersistanceManagerHandler } from "../3_services/UcpComponent.interface";
import { UcpModelChangelog, UcpModelEvents } from "../3_services/UcpModel.interface";
import BaseThing from "./BaseThing.class";

export enum PM_ACTION { create = "create", retrieve = "retrieve", update = "update", delete = "delete" }

export abstract class BasePersistanceManager extends BaseThing<any> implements PersistanceManager {

    abstract create(): Promise<void>
    abstract retrieve(): Promise<UDEObject>
    abstract update(): Promise<void>
    abstract delete(): Promise<void>
    abstract onModelChanged(changeObject: UcpModelChangelog): Promise<void>
    abstract onNotification(changeObject: UcpModelChangelog): Promise<void>
    protected ucpComponent: UcpComponent<any, any> | undefined;

    static getPersistenceManager(object: UcpComponent<any, any> | IOR): PersistanceManager | undefined {



        let ior: IOR;
        let ucpComponent: UcpComponent<any, any> | undefined;
        if ("IOR" in object) {
            ucpComponent = object;
            ior = object.IOR;
        } else {
            ior = object;

        }
        const aInterface = InterfaceDescriptor.getInterfaceByNameHack("PersistanceManager");
        if (!aInterface) {
            throw new Error("fail to find the persistence manager Interface");
        }

        const classList = aInterface.implementations.map(x => {
            return {
                result: (x.class.canHandle ? x.class.canHandle(ior) : 0) as number,
                aClass: x.class
            }
        }
        );
        const sortedClassList = classList.sort((a, b) => b.result - a.result);

        if (sortedClassList.length > 0 && classList[0].result > 0) {
            return new classList[0].aClass(ucpComponent);
        }
    }

    get ucpComponentData(): UDEObject {
        if (!this.ucpComponent) throw new Error("Missing ucpComponent");
        const ucpComponent = this.ucpComponent;
        const IOR = this.ucpComponent.IOR;
        const modelData = ucpComponent.ucpModel.toUDEStructure();

        if (!IOR.id) throw new Error("Missing IOR ID in " + IOR.href);
        const udeData: UDEObject = {
            id: IOR.id,
            instanceIOR: IOR.href,
            typeIOR: ucpComponent.classDescriptor.class.IOR.href,
            particle: modelData
        };

        return udeData;
    }

    constructor(ucpComponent?: UcpComponent<any, any>) {
        super();
        if (ucpComponent) {
            this.ucpComponent = ucpComponent;
            ucpComponent.Store.register(this);
            ucpComponent.ucpModel.eventSupport.addEventListener(UcpModelEvents.ON_MODEL_CHANGED, this.onModelChanged.bind(this), this);
        }
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
