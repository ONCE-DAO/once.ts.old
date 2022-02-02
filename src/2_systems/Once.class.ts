import { Once } from "./Once/Once";

Once.start();

// nodeLoader hooks
import { load, resolve } from "./Once/OnceNodeImportLoader";
export { load, resolve };
