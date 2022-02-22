import DefaultClassDescriptor from "../2_systems/Things/DefaultClassDescriptor.class";
import Thing, { ThingObjectState } from "../3_services/Thing.interface";
import ClassDescriptor from "../3_services/ClassDescriptor.interface";

export default abstract class BaseThing<ClassInterface> implements Thing<ClassInterface> {
  objectState: ThingObjectState = ThingObjectState.ACTIVE;

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
    this.objectState = ThingObjectState.DESTROYED;
  }




}
