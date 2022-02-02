// import { EAMDGitRepository } from "./2_systems/Git/EAMDGitRepository.class";
// // import { Once } from "./2_systems/Once/Once";

// export async function rebuild() {
//   console.log("REBUILD", Once);

//   const once = await Once.start();
//   const eamd = await once.getEAMD();
//   if (eamd?.eamdPath) {
//     (
//       await EAMDGitRepository.getInstance.init({ baseDir: eamd.eamdPath })
//     ).rebuildAllSubmodules();
//   }
//   //   if (global.ONCE) {
//   //     console.log("REBUILD");

//   //     const eamd = await global.ONCE.getEAMD();
//   //     if (eamd?.eamdPath) {
//   //       (
//   //         await EAMDGitRepository.getInstance.init({ baseDir: eamd.eamdPath })
//   //       ).rebuildAllSubmodules();
//   //     }
//   //   }
// }

// rebuild();
