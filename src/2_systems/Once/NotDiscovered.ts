import { OnceMode, OnceState } from "../../3_services/Once.interface";
import { DefaultEAMD } from "../EAMD/DefaultEAMD.class";
import { BaseOnce as Once } from "./BaseOnce.class";

export class NotDiscovered extends Once {
  state = OnceState.DISCOVER_FAILED;
  mode = OnceMode.NOT_DISCOVERED;

  static get instance() {
    return new NotDiscovered();
  }

  constructor() {
    super(global);
  }

  async start(): Promise<Once> {
    return this;
  }
  async getEAMD(): Promise<DefaultEAMD | undefined> {
    return undefined;
  }
}