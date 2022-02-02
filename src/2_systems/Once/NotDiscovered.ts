import { OnceMode, OnceState } from "../../3_services/Once.interface";
import { BaseOnce } from "./BaseOnce.class";

export class NotDiscovered extends BaseOnce {
  state = OnceState.DISCOVER_FAILED;
  mode = OnceMode.NOT_DISCOVERED;

  static get instance() {
    return new NotDiscovered();
  }
/**
 *
 */
constructor() {
  super(global);
 console.log("NOT DISCOVERD CTOR");
  
}
  startAsync = async () => this;
  installRepository = async () => undefined;
}
