import { Thing } from "./Thing.interface";
import { EAMD } from "./EAMD.interface";

/* eslint-disable no-unused-vars */
export enum OnceState {
  DISCOVER = "DISCOVER",
  DISCOVER_FAILED = "DISCOVER_FAILED",
  DISCOVER_SUCESS = "DISCOVER_SUCESS",
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
  NOT_DISCOVERED = "NOT_DISCOVERED"
}

export interface Once extends Thing {
  ENV: object;
  eamd: EAMD | undefined;
  creationDate: Date
  mode: OnceMode;
  state: OnceState;
  getEAMD(): Promise<EAMD | undefined>;
}