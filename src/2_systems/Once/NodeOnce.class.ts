import { OnceMode, OnceState } from "../../3_services/Once.interface";
import { BaseOnce } from "./BaseOnce.class";
import { EAMDRepository } from "../EAMDRepository.class";
import { Environment } from "../../3_services/Enviroment.interface";

export class NodeOnce extends BaseOnce implements Environment {
  ENV = process.env;
  public mode = OnceMode.NODE_JS;
  protected state = OnceState.DISCOVER_SUCESS;

  static get newInstance() {
    return new NodeOnce(global);
  }

  async startAsync(): Promise<BaseOnce> {
    //TODO install and start once.cli
    //TODO install and start once.webServer
    return this;
  }

  async installRepository(): Promise<EAMDRepository | undefined> {
    //TODO install Repo
    return undefined;
  }
}
