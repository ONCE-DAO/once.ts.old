import { OnceKernel } from "./Once/OnceKernel.class";
export { load, resolve, globalPreload } from "./Once/OnceNodeImportLoader";

await OnceKernel.start();



declare global{
    var NODE_JS:boolean
}