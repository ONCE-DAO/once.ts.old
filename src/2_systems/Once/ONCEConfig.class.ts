import UcpComponent from "../../3_services/UcpComponent.interface";
import UcpModel from "../../3_services/UcpModel.interface";
import BaseUcpComponent from "../../1_infrastructure/BaseUcpComponent.class";
import ClassDescriptor from "../Things/DefaultClassDescriptor.class";
import DefaultUcpModel, { UcpModelProxyIORSchema, UcpModelProxySchema } from "../Things/DefaultUcpModel.class";
import { z } from "../Zod";

export interface OnceConfig extends UcpComponent<ModelDataType, DefaultOnceConfig> {
    hostname: string;
    model: ModelDataType;
}

const modelSchema =
    z.object({
        hostname: z.string(),
        port: z.number(),
        protocol: z.string().regex(/^(http|https)$/),
        server: UcpModelProxyIORSchema.array().optional(),
    })
        .merge(BaseUcpComponent.modelSchema).merge(UcpModelProxySchema)
    ;


type ModelDataType = z.infer<typeof modelSchema>


@ClassDescriptor.componentExport("namedExport")
export default class DefaultOnceConfig extends BaseUcpComponent<ModelDataType, DefaultOnceConfig> implements OnceConfig {
    get hostname(): string { return this.model.hostname; }
    set hostname(value: string) { this.model.hostname = value }

    static get modelSchema() {
        return modelSchema;
    }

    public readonly ucpModel: UcpModel = new DefaultUcpModel<ModelDataType, DefaultOnceConfig>(DefaultOnceConfig.modelDefaultData, this);


    static get modelDefaultData() {
        return {
            ...super.modelDefaultData,
            hostname: 'localhost',
            port: 8443,
            protocol: 'https'
        }
    }
}




