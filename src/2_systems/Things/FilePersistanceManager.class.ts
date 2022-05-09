import { BasePersistanceManager } from "../../1_infrastructure/BasePersistanceManager.class"
import { OnceMode } from "../../3_services/Once.interface";
import UcpComponent from "../../3_services/UcpComponent.interface";
import { UcpModelChangelog } from "../../3_services/UcpModel.interface";

class FilePersistanceManager extends BasePersistanceManager {

    private ucpComponent: UcpComponent<any, any>;

    static canHandle(ucpComponent: UcpComponent<any, any>): number {
        if (ONCE && ONCE.mode === OnceMode.NODE_JS) {
            return 1;
        }
        return 0;
    }

    constructor(ucpComponent: UcpComponent<any, any>) {
        super();
        this.ucpComponent = ucpComponent;
    }

    get IOR() { return this.ucpComponent.IOR }


    create(): void {
        throw new Error("Method not implemented.");
    }
    retrieve(): void {
        throw new Error("Method not implemented.");
    }
    update(): void {
        throw new Error("Method not implemented.");
    }
    delete(): void {
        throw new Error("Method not implemented.");
    }
    load(): void {
        throw new Error("Method not implemented.");
    }
    onModelChanged(changeObject: UcpModelChangelog): void {
        throw new Error("Method not implemented.");
    }
    onNotification(changeObject: UcpModelChangelog): void {
        throw new Error("Method not implemented.");
    }

}

export default FilePersistanceManager;