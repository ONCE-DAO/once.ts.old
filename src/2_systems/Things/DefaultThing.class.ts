//@ts-nocheck
import { Thing } from "ior:esm:git:tla.EAM.layer1.Once";

export class DefaultThing implements Thing {
    static getInstance() {
        return new this;
    }

}