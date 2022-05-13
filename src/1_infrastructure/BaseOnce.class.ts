import EAMDInterface from "../3_services/EAMD.interface";
import Once, { OnceMode, OnceState } from "../3_services/Once.interface";
import DefaultThing from "./BaseThing.class";

import fs from "fs";
import DefaultOnceConfig, { OnceConfig } from "../2_systems/Once/ONCEConfig.class";
import DefaultIOR from "../2_systems/Things/DefaultIOR.class";

export abstract class BaseOnce extends DefaultThing<Once> implements Once {
  creationDate: Date;
  mode: OnceMode = OnceMode.BOOTING;
  state: OnceState = OnceState.DISCOVER;
  eamd: EAMDInterface | undefined;
  ENV: any;
  global: typeof globalThis;
  protected _config: OnceConfig | undefined;



  constructor(glob: typeof globalThis) {
    super();
    this.creationDate = new Date();
    glob.ONCE = this;
    this.global = glob;
    this.ENV = {};
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
        this._config = new DefaultOnceConfig();
        this._config.persistanceManager.addAlias(configAlias);
        await this._config.persistanceManager.create();
      }
    }
    return this._config;
  }

  get scenarioPath(): string {
    let path = process.cwd();
    if (path.match('/Scenarios/')) return path;

    if (this.mode === OnceMode.NODE_JS) {
      const pathList = path.split('/');
      while (pathList.length > 1) {
        let scenarioPath = pathList.join('/') + '/EAMD.ucp/Scenarios/'
        if (fs.existsSync(scenarioPath)) {
          scenarioPath += 'localhost/'
          if (!fs.existsSync(scenarioPath)) {
            fs.mkdirSync(scenarioPath)
          }
          return scenarioPath;
        }

        pathList.pop();

      }
    }
    throw new Error("Could not find scenario path");

  };

  abstract start(): Promise<Once>;
  abstract init(...a: any[]): any;
}
