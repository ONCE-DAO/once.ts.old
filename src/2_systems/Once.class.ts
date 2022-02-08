(await import("../1_infrastructure/OnceKernel.class.js")).default.start();
export {
  load,
  resolve,
  globalPreload,
} from "./Once/OnceNodeImportLoader.class";
