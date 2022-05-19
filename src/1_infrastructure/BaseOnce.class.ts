import EAMDInterface from "../3_services/EAMD.interface";
import Once, { OnceMode, OnceState } from "../3_services/Once.interface";
import DefaultThing from "./BaseThing.class";

import { OnceConfig } from "../2_systems/Once/ONCEConfig.class";
import DefaultIOR from "../2_systems/Things/DefaultIOR.class";
import ClassDescriptor from "../2_systems/Things/DefaultClassDescriptor.class";
import IOR from "../3_services/IOR.interface";

@ClassDescriptor.componentExport('namedExport')
export abstract class BaseOnce extends DefaultThing<Once> implements Once {
  creationDate: Date;
  mode: OnceMode = OnceMode.BOOTING;
  state: OnceState = OnceState.DISCOVER;
  eamd: EAMDInterface | undefined;
  ENV: any;
  global: typeof globalThis;
  protected _config: OnceConfig | undefined;


  async load(ior: IOR | string) {
    let iorObject: IOR;
    if (typeof ior === "string") {
      iorObject = new DefaultIOR().init(ior);
    } else {
      iorObject = ior;
    }
    return iorObject.load();
  }

  constructor(glob: typeof globalThis) {
    super();
    this.creationDate = new Date();
    glob.ONCE = this;
    this.global = glob;
    this.ENV = {};
    glob.ONCE_STARTED = true;
  }


  async getConfig(): Promise<OnceConfig> {
    const configAlias = 'onceConfig';
    if (this._config === undefined) {
      try {
        this._config = await new DefaultIOR().init('ior:ude:localhost/UDE/' + configAlias).load();
      } catch (e) {
        console.log("No stored ONCE Config Instance found");
      }
      if (this._config === undefined) {

        let DefaultOnceConfig = (await import("../2_systems/Once/ONCEConfig.class")).default;

        this._config = new DefaultOnceConfig();
        this._config.persistanceManager.addAlias(configAlias);
        await this._config.persistanceManager.create();
      }
    }
    return this._config;
  }

  abstract start(): Promise<Once>;
  abstract init(...a: any[]): any;
}
