import { InterfaceDescriptor } from "../2_systems/Things/DefaultClassDescriptor.class";
import PersistanceManager from "../3_services/PersistanceManager.interface";
import UcpComponent from "../3_services/UcpComponent.interface";
import { UcpModelChangelog } from "../3_services/UcpModel.interface";
import BaseThing from "./BaseThing.class";

export abstract class BasePersistanceManager extends BaseThing<any> implements PersistanceManager {

    abstract create(): void
    abstract retrieve(): void
    abstract update(): void
    abstract delete(): void
    abstract load(): void
    abstract onModelChanged(changeObject: UcpModelChangelog): void
    abstract onNotification(changeObject: UcpModelChangelog): void

    static getPersistenceManager(ucpComponent: UcpComponent<any, any>): PersistanceManager | undefined {

        // HACK Wird ersetzt durch Components und Interface Integration
        if (!ONCE) throw new Error("Missing ONCE");
        const packagePath = ONCE.classDescriptor.packagePath as string;
        const packageName = ONCE.classDescriptor.packageName as string;
        const packageVersion = ONCE.classDescriptor.packageVersion;


        const aInterfaceName = InterfaceDescriptor.uniqueName(packagePath, packageName, packageVersion, "PersistanceManager");
        const aInterface = InterfaceDescriptor.getInterfaceByName(aInterfaceName);
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
}