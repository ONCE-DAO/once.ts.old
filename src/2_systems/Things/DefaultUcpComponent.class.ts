import UcpComponent, { UcpComponentStatics } from "../../3_services/UcpComponent.interface";
import { z } from "zod";
import UcpModel from "../../3_services/UcpModel.interface";
import { DefaultUcpModel } from "./DefaultUcpModel.class";
import { BaseUcpComponent } from "../../1_infrastructure/BaseUcpComponent.class";



const modelSchema = BaseUcpComponent.modelSchema.merge(
    z.object({
        name: z.string(),
        age: z.number().optional(),
        inventory: z.object({
            name: z.string().optional(),
            itemId: z.number().optional(),
        }).array().optional()
    })
);

type ModelDataTypeDef = z.infer<typeof modelSchema>

class DefaultUcpComponent extends BaseUcpComponent<ModelDataTypeDef> {

    private ucpModel: UcpModel<ModelDataTypeDef> = new DefaultUcpModel<ModelDataTypeDef>(DefaultUcpComponent.modelDefaultData, this);

    get model() {
        return this.ucpModel.model;
    }

    static get modelSchema() {
        return modelSchema;
        //return super.modelSchema.merge(modelSchema);
    }

    static get modelDefaultData() {
        return {
            ...super.modelDefaultData,
            name: 'MyDefaultName'
        }
    }
}

const DefaultUcpComponentExport: UcpComponentStatics<ModelDataTypeDef> = DefaultUcpComponent;

export default DefaultUcpComponentExport;


