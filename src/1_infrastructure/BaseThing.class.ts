import Thing from "../3_services/Thing.interface";

abstract class DefaultThing<T> implements Thing<T> {
  private _id: string | undefined;
  get id() {
    // TODO Preplace with correct ID generator
    if (!this._id) {
      this._id = Math.round(Math.random() * 1000000000000) + "";
    }
    return this._id;
  }

  init(...a: any[]) {
    return this;
  }

  start(): Promise<T> {
    throw new Error("Method not implemented.");
  }

  static getInstance() {
    // HACK
    // @ts-ignore
    return new this();
  }

  destroy(): void {

  }
}
export default DefaultThing;
