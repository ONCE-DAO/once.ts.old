import { loadingConfig } from "./Loader.interface";

export interface IorInterface {

  load(config: loadingConfig): Promise<any>
}

export default IorInterface;