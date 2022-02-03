import { Once, OnceMode, OnceState } from "../../3_services/Once.interface";
import { DefaultEAMD } from "../EAMD/DefaultEAMD.class";
import { OnceKernel } from "./OnceKernel.class";

export class NotDiscovered extends OnceKernel {
  state = OnceState.DISCOVER_FAILED;
  mode = OnceMode.NOT_DISCOVERED;

  ENV = {};

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
