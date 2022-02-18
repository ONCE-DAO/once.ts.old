import { z } from "zod";
import DefaultUcpModel, { UcpModelProxySchema } from "../2_systems/Things/DefaultUcpModel.class";
import UcpComponent from "../3_services/UcpComponent.interface";
import UcpModel from "../3_services/UcpModel.interface";
import BaseThing from "./BaseThing.class";

export default abstract class BaseUcpComponent<ModelDataType, ClassInterface> extends BaseThing<ClassInterface> implements UcpComponent<ModelDataType, ClassInterface> {
    get model(): ModelDataType {
        return this.ucpModel.model;
    }

    set model(value: ModelDataType) {
        this.ucpModel.model = value;
    }

    static get modelSchema() {
        return UcpModelProxySchema.extend({
            _component: UcpModelProxySchema.extend({
                name: z.string()
            })
        })
    }

    protected abstract ucpModel: UcpModel;


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