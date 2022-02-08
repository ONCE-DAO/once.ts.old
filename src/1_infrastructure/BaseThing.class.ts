import DefaultTypeDescriptor from "../2_systems/Things/DefaultTypeDescriptor.class";
import Thing from "../3_services/Thing.interface";
import TypeDescriptor, { TSClass } from "../3_services/TypeDescriptor.interface";


export default abstract class BaseThing<T> implements Thing<T> {
  type: any;
  get name(): string { return this.constructor.name };
  private _id: string | undefined;
  private _typeDescriptor: TSClass | undefined;
  get id() {
    // TODO Preplace with correct ID generator
    if (!this._id) {
      this._id = Math.round(Math.random() * 1000000000000) + "";
    }
    return this._id;
  }

  init(...a: any[]) {
    this.typeDescriptor
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

  // get typeDescriptor(): TSClass {
  //   if (!this.constructor._typeDescriptor) this.constructor._typeDescriptor = new TSClass(this.constructor);
  //   return this.constructor._typeDescriptor
  // }

  get typeDescriptor(): TSClass {
    if (!this._typeDescriptor) this._typeDescriptor = new TSClass(this.constructor);
    return this._typeDescriptor
  }


  // static get typeDescriptor(): any {
  //   if (!this._typeDescriptor) {
  //     this._typeDescriptor = new DefaultTypeDescriptor();
  //   }
  //   return this._typeDescriptor;
  // }

  // get typeDescriptor(): TypeDescriptor {
  //   return this.class.typeDescriptor;
  // }

}
