import { getCommentRange } from "typescript";
import { JSONProvider } from "./JSON.interface";

export enum urlProtocol {
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

type numberOrUndefined = number | undefined

//@xxxxx.declareInterface(): InterfaceDescriptor
export interface Url extends JSONProvider {

  href: string;
  protocol: urlProtocol[];
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
}



export default Url;