
export enum urlProtocol { "http", "https", "ws", "wss", "ior", "ude", "git", "esm" }


export interface UrlInterface {

  href: string;
  protocol: urlProtocol[];
  port: number | undefined;
  search: string | undefined;
  hostName: string | undefined;
  host: string | undefined;
  pathName: string | undefined;
  hash: string | undefined;
  origin: string | undefined;
  isOwnOrigin: boolean;
  originPath: string | undefined;
  searchParameters: { [key: string]: string }
}



export default UrlInterface;