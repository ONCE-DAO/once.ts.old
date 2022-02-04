
// TODO@PB die yeile unten ist in jedem Fall bloedsinn und referenziert jetzt Once.ts 
import { Once } from "./Once/Once";

// TODO@PB Once.ts loeschen und aus der file history von Once.class.js wieder herstellen  
Once.start();
 console.log("foo");
 

// nodeLoader hooksxxxx
import { load, resolve } from "./Once/OnceNodeImportLoader";
export { load, resolve };
