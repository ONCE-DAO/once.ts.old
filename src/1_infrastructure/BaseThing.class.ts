import DefaultClassDescriptor from "../2_systems/Things/DefaultClassDescriptor.class";
import Thing, { ThingStatics } from "../3_services/Thing.interface";
import ClassDescriptor from "../3_services/ClassDescriptor.interface";
import WeakRefPromiseStore from "../2_systems/Things/WeakRefPromiseStore.class";
import Store from "../3_services/Store.interface";
import Class from "../3_services/Class.interface";
import { Metaclass, TSClass } from "../3_services/TypeDescriptor.interface";

export default abstract class BaseThing<T> implements Thing<T> {

  private static _typeDescriptorStore = new WeakMap();
  static get classDescriptor(): ClassDescriptor {
    let result = this._typeDescriptorStore.get(this);
    if (!result) {
      // @ts-ignore
      // It is abstract, but TS does not understand that
      result = new DefaultClassDescriptor().init(this);
      this._typeDescriptorStore.set(this, result);
    }
    return result;
  }

  get classDescriptor(): ClassDescriptor {
    //TODO@MD Check how to do it better
    // @ts-ignore
    return this.constructor.classDescriptor;
  }


  static get class(): Metaclass | undefined {
    return Metaclass.getClass(this);
    let result = this._typeDescriptorStore.get(this);
    if (!result) {
      // @ts-ignore
      // It is abstract, but TS does not understand that
      result = new DefaultClassDescriptor().init(this);
      this._typeDescriptorStore.set(this, result);
    }
    return result;
  }

  get class(): Metaclass | undefined {
    //TODO@MD Check how to do it better
    // @ts-ignore
    return this.constructor.classDescriptor;
  }



  get name(): string { return this.constructor.name };
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


  static getInstance() {
    // HACK
    // @ts-ignore
    return new this();
  }

  destroy(): void {

  }


}
