import Thing from "./Thing.interface";
import EAMD from "./EAMD.interface";

export default interface Once extends Thing<Once> {
  ENV: NodeJS.ProcessEnv;
  eamd: EAMD | undefined;
  creationDate: Date;
  mode: OnceMode;
  state: OnceState;
  start(): void;
  scenarioPath: string;
}

declare global {
  var ONCE: Once | undefined;
  var NODE_JS: boolean;
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
