import { loadingConfig } from "./Loader.interface";
import UrlInterface from "./Url.interface";

export interface IorInterface extends UrlInterface {

  load(config: loadingConfig): Promise<any>
}

export default IorInterface;