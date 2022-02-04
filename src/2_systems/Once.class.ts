import { BaseOnce } from "../1_infrastructure/BaseOnce.class";
export {
  load,
  resolve,
  globalPreload,
} from "./Once/OnceNodeImportLoader.class";

await BaseOnce.start();
