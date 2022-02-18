import UcpComponent, { UcpComponentStatics } from "../../3_services/UcpComponent.interface";
import { z } from "zod";
import UcpModel from "../../3_services/UcpModel.interface";
import { DefaultUcpModel } from "./DefaultUcpModel.class";
import { BaseUcpComponent } from "../../1_infrastructure/BaseUcpComponent.class";





type ModelDataTypeDef = z.infer<typeof DefaultUcpComponent.modelSchema>

const DefaultUcpComponent: UcpComponentStatics = class DefaultUcpComponent extends BaseUcpComponent implements UcpComponent {

    private ucpModel: UcpModel<ModelDataTypeDef> = new DefaultUcpModel<ModelDataTypeDef>(DefaultUcpComponent.modelDefaultData, this);

    get model(): ModelDataTypeDef {
        return this.ucpModel.model;
    }

    static get modelSchema() {
        return super.modelSchema.merge(
            z.object({
                name: z.string(),
                age: z.number().optional(),
                inventory: z.object({
                    name: z.string().optional(),
                    itemId: z.number().optional(),
                }).array().optional()
            })
        );
    }

    static get modelDefaultData() { return { name: 'DefaultUcpComponent' } }


}

export default DefaultUcpComponent;


