import { loadingConfig } from "./Loader.interface";
import { urlProtocol } from "./Url.interface";

type numberOrUndefined = number | undefined

export enum iorProtocol {
  "http" = "http",
  "https" = "https",
  "ws" = "ws",
  "wss" = "wss",
  "ior" = "ior",
  "ude" = "ude",
  "git" = "git",
  "github" = "github",
  "file" = "file",
  "esm" = "esm"
}

interface IOR {
  protocol: iorProtocol[];

  toString(): string | undefined;
  fromString(value: string): this;
  init(value: string): this;

  load(config?: loadingConfig): Promise<any>

  clone(): IOR;

}

export interface IOR_URL extends IOR {

  href: string;
  port: number | undefined;
  search: string | undefined;
  hostName: string | undefined;
  host: string | undefined;
  pathName: string | undefined;
  hash: string | undefined;
  anchor: string | undefined;
  origin: string | undefined;
  isOwnOrigin: boolean;
  originPath: string | undefined;
  searchParameters: { [key: string]: string }
  hosts: string[];
  hostNames: string[];
  ports: numberOrUndefined[];
  fileName: string | undefined;
  fileType: string | undefined;
  fileTypes: string[];
  clone(): IOR_URL;
}


export interface IOR_ESM extends IOR {

  namespace: string | undefined;
  namespaceVersion: string | undefined;
  namespaceObject: string | undefined;

  clone(): IOR_URL;
}

export interface IOR_UDE extends IOR_URL {

  directory: string | undefined;
  id: string | undefined;
  clone(): IOR_URL;
}


export default IOR;