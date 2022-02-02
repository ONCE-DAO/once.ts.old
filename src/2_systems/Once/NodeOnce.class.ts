import { OnceMode, OnceState } from "../../3_services/Once.interface";
import { BaseOnce } from "./BaseOnce.class";
import { EAMDRepository } from "../EAMDRepository.class";

export class NodeOnce extends BaseOnce {
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
