import UcpComponent from "../../3_services/UcpComponent.interface";
import { z } from "zod";
import UcpModel from "../../3_services/UcpModel.interface";
import DefaultUcpModel, { UcpModelProxySchema, UcpModelSchemaConverter } from "./DefaultUcpModel.class";
import BaseUcpComponent from "../../1_infrastructure/BaseUcpComponent.class";


interface MyDefaultUcpComponent extends UcpComponent<ModelDataType, MyDefaultUcpComponent> {
    myName: string | undefined;
}

const modelSchema = BaseUcpComponent.modelSchema.merge(
    z.object({
        name: z.string(),
        myName: z.string().optional(),
        age: z.number().optional(),
        inventory: UcpModelProxySchema.extend({
            name: z.string().optional(),
            itemId: z.number().optional(),
        }).array().optional(),
        subOptions: UcpModelProxySchema.extend({
            someString: z.string().optional(),
        }).optional(),
    })
);

const test = UcpModelSchemaConverter(modelSchema, true)

type ModelDataType = z.infer<typeof test>


class DefaultUcpComponent extends BaseUcpComponent<ModelDataType, MyDefaultUcpComponent> implements MyDefaultUcpComponent {
    get myName() { return this.model.myName }

    static get modelSchema() {
        return modelSchema;
    }

    public readonly ucpModel: UcpModel = new DefaultUcpModel<ModelDataType>(DefaultUcpComponent.modelDefaultData, this);


    static get modelDefaultData() {
        return {
            ...super.modelDefaultData,
            name: 'MyDefaultName'
        }
    }
}

//const DefaultUcpComponentExport: UcpComponentStatics<ModelDataType, MyDefaultUcpComponent> = DefaultUcpComponent;

export default DefaultUcpComponent;


