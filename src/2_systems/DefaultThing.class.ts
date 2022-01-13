import { Thing } from "../3_services/Thing.interface";

export class DefaultThing implements Thing {
    private _id: string | undefined;
    public get id (): string | undefined {
      return this._id
    }

    public set id (value: string | undefined) {
      this._id = value
    }

    private _name: string | undefined;
    public get name (): string | undefined {
      return this._name
    }

    public set name (value: string | undefined) {
      this._name = value
    }
}
