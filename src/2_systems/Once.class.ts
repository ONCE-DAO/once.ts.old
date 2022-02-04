import { BaseOnce } from "../1_infrastructure/BaseOnce.class";
export {
  load,
  resolve,
  globalPreload,
} from "./Once/OnceNodeImportLoader.class";

if (global.started !== undefined && !global.started) {
  global.started = true;
  await BaseOnce.start();
}
else {
  console.log("sdsd")
}
