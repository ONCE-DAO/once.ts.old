// import { load, resolve } from "./Once/OnceNodeImportLoader";
// export { load, resolve };



import { Once } from "./Once/Once";


Once.start();
console.log("foo");


// nodeLoader hooksxxxx
// import { load, resolve } from "./Once/OnceNodeImportLoader";
// export { load, resolve };

// @ts-ignore
let IOR = await import("ior:esm:git:tla.EAM.Once");
IOR;


