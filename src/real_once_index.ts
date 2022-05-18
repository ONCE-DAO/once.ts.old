// Hier sind dann noch alle echten exports von once.ts


import DefaultIOR from "./2_systems/Things/DefaultIOR.class";
export { DefaultIOR };


(await import("./1_infrastructure/OnceKernel.class.js")).default.start();
