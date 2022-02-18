import UcpComponent from "../../3_services/UcpComponent.interface";
import UcpModel from "../../3_services/UcpModel.interface";

export class DefaultUcpModel<ModelDataType> implements UcpModel<ModelDataType> {
    private data: ModelDataType;
    get model(): ModelDataType { return this.data }

    constructor(defaultData: ModelDataType, ucpComponent: UcpComponent) {
        ucpComponent.classDescriptor.class
        this.data = defaultData;
    }
}
