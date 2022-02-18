import UcpComponent, { UcpComponentStatics } from "../../3_services/UcpComponent.interface";
import { z } from "zod";
import UcpModel from "../../3_services/UcpModel.interface";
import DefaultUcpModel, { UcpModelProxySchema } from "./DefaultUcpModel.class";
import BaseUcpComponent from "../../1_infrastructure/BaseUcpComponent.class";


interface MyDefaultUcpComponent extends UcpComponent<ModelDataTypeOutput, MyDefaultUcpComponent> {
    myName: string | undefined;
}

const modelSchema = BaseUcpComponent.modelSchema.merge(
    UcpModelProxySchema.extend({
        name: z.string(),
        myName: z.string().optional(),
        age: z.number().optional(),
        inventory: UcpModelProxySchema.extend({
            name: z.string().optional(),
            itemId: z.number().optional(),
        }).array().optional()
    })
);

type ModelDataTypeOutput = z.infer<typeof modelSchema>



class DefaultUcpComponent extends BaseUcpComponent<ModelDataTypeOutput, MyDefaultUcpComponent> implements MyDefaultUcpComponent {
    get myName() { return this.model.myName }

    static get modelSchema() {
        return modelSchema;
    }

    protected ucpModel: UcpModel = new DefaultUcpModel<ModelDataTypeOutput>(DefaultUcpComponent.modelDefaultData, this);


    static get modelDefaultData() {
        return {
            ...super.modelDefaultData,
            name: 'MyDefaultName'
        }
    }
}

//const DefaultUcpComponentExport: UcpComponentStatics<ModelDataType, MyDefaultUcpComponent> = DefaultUcpComponent;

export default DefaultUcpComponent;


