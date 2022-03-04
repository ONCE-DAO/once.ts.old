import Thing, { ThingObjectState } from "../3_services/Thing.interface";
//import ClassDescriptor from "../3_services/ClassDescriptor.interface";

import EventService from "../3_services/EventService.interface";
import { Metaclass, TSClass } from '../3_services/TypeDescriptor.interface';
import ClassDescriptor from "../2_systems/Things/DefaultClassDescriptor.class";

export enum emptyEventList { }

export default abstract class BaseThing<ClassInterface> implements Thing<ClassInterface> {
  objectState: ThingObjectState = ThingObjectState.ACTIVE;

  EVENT_NAMES = emptyEventList;
  protected _eventSupport!: EventService<any>;

  static get classDescriptor(): ClassDescriptor {
    if (this === BaseThing) {
      throw new Error("Can only be called on the Class")
    }
    // @ts-ignore
    return ClassDescriptor.getClassDescriptor4Class(this);
  }

  get classDescriptor(): ClassDescriptor {
    //TODO@MD Check how to do it better
    // HACK
    // @ts-ignore
    return this.constructor.classDescriptor;
  }



  static get type(): TSClass {
    return Metaclass.getClass(this);
  }

  get type(): Metaclass {
    //TODO@MD Check how to do it better
    // HACK
    // @ts-ignore
    return (this.constructor as Metaclass).type.metaclass;
  }
  
  get tsClass(): TSClass {
    //TODO@MD Check how to do it better
    // HACK
    // @ts-ignore
    return Metaclass.getClass(this.constructor) as TSClass;
  }

  protected _name: string | undefined;
  get name(): string { return this._name || this.constructor.name };

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
