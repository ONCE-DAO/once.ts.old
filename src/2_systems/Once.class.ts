console.log("Once.class.ts startup sequence");

(await import("../1_infrastructure/OnceStarter.class.js")).default.start();
export {
  load,
  resolve,
  globalPreload,
} from "./Once/OnceNodeImportLoader.class";
