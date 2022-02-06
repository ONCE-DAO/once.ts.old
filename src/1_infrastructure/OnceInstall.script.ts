import { RootEAMD } from "../2_systems/EAMD/RootEAMD.class.js";
import { UserEAMD } from "../2_systems/EAMD/UserEAMD.class.js";

const rootEAMD = RootEAMD.getInstance().init();
if (rootEAMD.hasWriteAccess()) {
  if (!rootEAMD.isInstalled()) await rootEAMD.install();
} else {
  const userEAMD = UserEAMD.getInstance().init();
  if (userEAMD.hasWriteAccess()) {
    if (!userEAMD.isInstalled()) await userEAMD.install();
  }
}

export {};
