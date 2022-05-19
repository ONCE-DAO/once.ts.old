import Thing from "./Thing.interface";
import EAMD from "./EAMD.interface";
import { OnceConfig } from "../2_systems/Once/ONCEConfig.class";
import { InterfaceDescriptor } from "../2_systems/Things/DefaultClassDescriptor.class";
import IOR from "./IOR.interface";

export default interface Once extends Thing<Once> {
  ENV: NodeJS.ProcessEnv;
  eamd: EAMD | undefined;
  creationDate: Date;
  mode: OnceMode;
  state: OnceState;
  start(): void;
  getConfig(): Promise<OnceConfig>;
  load(ior: IOR | string): Promise<any>;
}

export const OnceID = InterfaceDescriptor.lastDescriptor;

declare global {
  var ONCE_STARTED: boolean;
  var ONCE: Once;
  var NODE_JS: boolean;
}

if (typeof window !== "undefined") {
  window.ONCE_STARTED = false;
} else {
  global.ONCE_STARTED = false;
}


/* eslint-disable no-unused-vars */
export enum OnceState {
  DISCOVER = "DISCOVER",
  DISCOVER_FAILED = "DISCOVER_FAILED",
  DISCOVER_SUCCESS = "DISCOVER_SUCESS",
  INITIALIZED = "INITIALIZED",
  STARTED = "STARTED",
  STOPPED = "STOPPED",
}

export enum OnceMode {
  BOOTING = "BOOTING",
  BROWSER = "BROWSER",
  NODE_JS = "NODE_JS",
  NODE_LOADER = "NODE_LOADER",
  WEB_WORKER = "WEB_WORKER",
  SERVICE_WORKER = "SERVICE_WORKER",
  I_FRAME = "I_FRAME",
  NOT_DISCOVERED = "NOT_DISCOVERED",
}

type OnceRuntime =
  | OnceMode.BROWSER
  | OnceMode.NODE_JS
  | OnceMode.NODE_LOADER
  | OnceMode.WEB_WORKER
  | OnceMode.SERVICE_WORKER;

export type OnceRuntimeResolver = {
  [key in OnceRuntime]: () => boolean;
};
