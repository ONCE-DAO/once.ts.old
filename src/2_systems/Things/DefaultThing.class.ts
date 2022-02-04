import Thing from "../../3_services/Thing.interface";

abstract class DefaultThing implements Thing<DefaultThing> {
  private _id: string | undefined;
  get id() {
    if (!this._id) {
      this._id = Math.round(Math.random() * 1000000000) + "";
    }
    return this._id;
  }

  start(): Promise<DefaultThing> {
    throw new Error("Method not implemented.");
  }

  static getInstance() {
    // HACK
    // @ts-ignore
    return new this();
  }
}
export default DefaultThing;
