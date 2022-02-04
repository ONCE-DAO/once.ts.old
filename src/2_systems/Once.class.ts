import { OnceKernel } from "./Once/OnceKernel.class";
export {
  load,
  resolve,
  globalPreload,
} from "./Once/OnceNodeImportLoader.class";

if (global.started !== undefined && !global.started) {
  global.started = true;
  await OnceKernel.start();
}
else {
    console.log("sdsd")
}
