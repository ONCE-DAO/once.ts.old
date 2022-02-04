import { OnceKernel } from "./NewOnce/OnceKernel.class";
export { load, resolve, globalPreload } from "./NewOnce/OnceNodeImportLoader";

await OnceKernel.start();



declare global{
    var NODE_JS:boolean
}