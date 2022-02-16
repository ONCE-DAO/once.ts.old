import DefaultTypeDescriptor from "../2_systems/Things/DefaultTypeDescriptor.class";
import Thing from "../3_services/Thing.interface";
import TypeDescriptor from "../3_services/TypeDescriptor.interface";
import { TSClass } from '../3_services/TypeDescriptor.interface';

export default abstract class BaseThing<T> implements Thing<T> {
  type: any;
  get name(): string { return this.constructor.name };
  static _typeDescriptor: any;
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

  get class(): any {
    return this.constructor
  }

  static get typeDescriptor(): any {
    if (!this._typeDescriptor) {
      this._typeDescriptor = new DefaultTypeDescriptor().init(this);
    }
    return this._typeDescriptor;
  }

  get typeDescriptor(): TypeDescriptor {
    return this.class.typeDescriptor;
  }

}
