import { Thing } from "../../3_services/Thing.interface";

class DefaultThing implements Thing {
    start(): Promise<Thing> {
        throw new Error("Method not implemented.");
    }
    static getInstance() {
        return new this();
    }
}
export default DefaultThing;
