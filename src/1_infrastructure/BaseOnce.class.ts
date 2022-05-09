import EAMDInterface from "../3_services/EAMD.interface";
import Once, { OnceMode, OnceState } from "../3_services/Once.interface";
import DefaultThing from "./BaseThing.class";

import fs from "fs";

export abstract class BaseOnce extends DefaultThing<Once> implements Once {
  creationDate: Date;
  mode: OnceMode = OnceMode.BOOTING;
  state: OnceState = OnceState.DISCOVER;
  eamd: EAMDInterface | undefined;
  ENV: any;
  global: typeof globalThis;


  constructor(glob: typeof globalThis) {
    super();
    this.creationDate = new Date();
    glob.ONCE = this;
    this.global = glob;
    this.ENV = {};
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
