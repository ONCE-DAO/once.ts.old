// import { Environment } from "../../3_services/Enviroment.interface";
// import { OnceMode, OnceState } from "../../3_services/Once.interface";
// import { Once } from "../../3_services/Once.interface";
// import { DefaultEAMD as EAMD } from "../EAMD/DefaultEAMD.class";
// import DefaultThing from "../Things/DefaultThing.class";

// export abstract class OnceKernel extends DefaultThing implements Once {
//   creationDate: Date;
//   public mode: OnceMode = OnceMode.BOOTING;
//   state: OnceState = OnceState.DISCOVER;
//   eamd: EAMD | undefined;

//   protected constructor(global: typeof globalThis) {
//     super();
//     this.creationDate = new Date();
//     // TODO @ PB check node loader sequence side effects
//     // global.ONCE = this
//   }


//   // TODO @PB&MD extract in interface
//   abstract start(): Promise<Once>;
//   abstract getEAMD(): Promise<EAMD | undefined>;

//   // ONCE ENTRY POINT
//   static async start(): Promise<Once> {
//     console.log("Once.class static start");
//     const once = await this.discover();
//     once.eamd = await once.getEAMD();
//     await once.start();

//     console.log(
//       `ONCE
//        created [${once.creationDate.toISOString()}] 
//        installed [${once.eamd === undefined
//         ? false
//         : (once.eamd.installedAt
//           ? once.eamd.installedAt?.toISOString()
//           : "existed already"
//         )

//       }]
//        mode [${once.mode}]
//        state [${once.state}]`
//     );
//     return once;
//   }

//   static async discover(): Promise<Once> {
//     throw new Error("Not implemented in BaseClass");
//   }

//   protected static get isBrowser() {
//     return (
//       typeof window !== "undefined" && typeof window.document !== "undefined"
//     );
//   }

//   protected static get isNode() {
//     return (
//       typeof process !== "undefined" &&
//       process.versions != null &&
//       process.versions.node != null
//     );
//   }

//   protected static async isNodeLoader(): Promise<boolean> {
//     if (global.ONCE === undefined) {
//       // any import would be hooked and set global.ONCE to NodeImportLoaderOnceInstance
//       await import("./OnceNodeImportLoader.js");
//       if (global.ONCE !== undefined) return true;
//     }
//     return false;
//   }

//   protected static get isWebWorker() {
//     return (
//       typeof self === "object" &&
//       self.constructor &&
//       self.constructor.name === "DedicatedWorkerGlobalScope"
//     );
//   }

//   protected static get isServiceWorker() {
//     return (
//       typeof self === "object" &&
//       self.constructor &&
//       self.constructor.name === "ServiceWorkerGlobalScope"
//     );
//   }

//   protected static get isServiceWorkerSupported() {
//     return navigator && "serviceWorker" in navigator;
//   }
// }
