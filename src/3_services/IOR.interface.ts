import { loadingConfig } from "./Loader.interface";
import Url from "./Url.interface";

export interface IOR extends Url {

  load(config: loadingConfig): Promise<any>
  namespace: string | undefined;
  namespaceVersion: string | undefined;
  namespaceObject: string | undefined;
  id: string | undefined;
}

export default IOR;