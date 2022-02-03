import { Thing } from "../../3_services/Thing.interface";

class DefaultThing implements Thing {
    private _id: string | undefined;
    get id() {
        if (!this._id) {
            this._id = Math.round(Math.random() * 1000000000) + ''
        }
        return this._id;
    }


    start(): Promise<Thing> {
        throw new Error("Method not implemented.");
    }
    static getInstance() {
        return new this();
    }
}
export default DefaultThing;
