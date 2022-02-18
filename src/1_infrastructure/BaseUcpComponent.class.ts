import { string, z } from "zod";
import UcpComponent, { UcpComponentStatics } from "../3_services/UcpComponent.interface";
import BaseThing from "./BaseThing.class";

export abstract class BaseUcpComponent<ModelDataType> extends BaseThing<UcpComponent<ModelDataType>> implements UcpComponent<ModelDataType> {
    abstract model: any;

    static get modelSchema() {
        return z.object({
            _component: z.object({
                name: z.string()
            })
        })
    }

    static get modelDefaultData() {
        return { _component: { name: this.name } }
    }


}

/*
            age: z.number().optional(),
            inventory: z.object({
                name: z.string().optional(),
                itemId: z.number().optional(),
            }).array().optional()
            */