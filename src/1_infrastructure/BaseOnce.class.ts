import EAMDInterface from "../3_services/EAMD.interface";
import Once, { OnceMode, OnceState } from "../3_services/Once.interface";
import DefaultThing from "./BaseThing.class";

export abstract class BaseOnce extends DefaultThing<Once> implements Once {
  eamd: EAMDInterface | undefined;
  creationDate: Date;
  mode: OnceMode = OnceMode.BOOTING;
  state: OnceState = OnceState.DISCOVER;

  constructor(glob: typeof globalThis) {
    super();
    this.creationDate = new Date();
    glob.ONCE = this;
  }
  
  abstract start(): Promise<Once>;
  abstract init(...a: any[]): any;
}
