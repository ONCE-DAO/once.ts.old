import { OnceKernel } from "./Once/OnceKernel.class";
export { load, resolve, globalPreload } from "./Once/OnceNodeImportLoader.class";

await OnceKernel.start();
