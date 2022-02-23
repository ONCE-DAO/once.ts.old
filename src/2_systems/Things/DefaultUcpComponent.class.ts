import UcpComponent from "../../3_services/UcpComponent.interface";
import { z } from "zod";
import UcpModel from "../../3_services/UcpModel.interface";
import DefaultUcpModel, { UcpModelProxyIORSchema, UcpModelProxySchema } from "./DefaultUcpModel.class";
import BaseUcpComponent from "../../1_infrastructure/BaseUcpComponent.class";


interface MyDefaultUcpComponent extends UcpComponent<ModelDataType, MyDefaultUcpComponent> {
    myName: string | undefined;
}

const modelSchema =
    z.object({
        name: z.string(),
        myName: z.string().optional(),
        age: z.number().optional(),
        iorObject: UcpModelProxyIORSchema.optional(),
        inventory: z.object({
            name: z.string().optional(),
            itemId: z.number().optional(),
        }).array().optional(),
        subOptions: z.object({
            someString: z.string().optional(),
        }).merge(UcpModelProxySchema).optional(),
        someMap: z.map(z.string(), z.number()).optional(),
        someNumberMap: z.map(z.number(), z.number()).optional(),
        someIORMap: z.map(UcpModelProxyIORSchema, z.number()).optional()

    })
        .merge(BaseUcpComponent.modelSchema).merge(UcpModelProxySchema)
    ;

const convertedModelSchema = modelSchema //.merge(UcpModelProxySchema);


const mySchema = z.object({
    myString: z.string().min(5),
    myUnion: z.union([z.number(), z.boolean()]),
});

// function convert<T extends >(schema: T): T {
//     schema.merge(UcpModelProxySchema);
// }

//const convertedModelSchema = UcpModelSchemaConverter(modelSchema, { optional: false })



type ModelDataType = z.infer<typeof convertedModelSchema>

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


