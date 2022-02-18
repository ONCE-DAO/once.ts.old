import UcpComponent from "../../3_services/UcpComponent.interface";
import UcpModel from "../../3_services/UcpModel.interface";

export default class DefaultUcpModel<ModelDataType> implements UcpModel<ModelDataType> {
    private data: ModelDataType;
    get model(): ModelDataType { return this.data }

    constructor(defaultData: ModelDataType, ucpComponent: UcpComponent<ModelDataType, any>) {
        const modelSchema = ucpComponent.classDescriptor.class.modelSchema;
        const data2Set = modelSchema.parse(defaultData)
        this.data = data2Set;
    }
}
