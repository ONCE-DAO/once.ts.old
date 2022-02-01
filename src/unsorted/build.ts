import { execSync } from "child_process";
import { GitRepository } from "./GitRepository";
import fs from "fs";
import os from "os";
import path from "path";
import { Package } from "./Package";

function getEAMDPath() {
  return (
    isInstalled("/EAMD.ucp") ||
    isInstalled("/var/EAMD.ucp") ||
    isInstalled(path.join(os.userInfo().homedir, "EAMD.ucp"))
  );
}

function highlight(text: string, ...args: any[]) {
  console.log(`\u001b[1;46m${text}\u001b[0m`, args);
}

function isInstalled(str: string) {
  if (fs.existsSync(str)) return str;
  return undefined;
}

export async function build(prefix: string | undefined) {
  if (!prefix) {
    console.log("ONCE NOT INSTALLED CANCELED");
    return;
  }

  // console.log(process.argv);
  if (!process.argv.includes("--fast")) {
    highlight("Clean all node_modules");
    execSync(`npm --prefix ${prefix} run lerna:clean`);
    execSync(`rm -r ${path.join(prefix, "node_modules")}`);
    execSync(`npm --prefix ${prefix} install`);
    highlight("npm packages reinstalled");
  }
  execSync(`npm --prefix ${prefix} run lerna:bootstrap`);
  highlight("all node_modules installed recursive");

  const eamdRepository = await GitRepository.start({ baseDir: prefix });

  (await eamdRepository.submodules).forEach(async (submodule) => {
    
    const pkg = await Package.getByPath(path.join(prefix,submodule,"package.json"));
  execSync(`npm --prefix ${prefix} run lerna:bootstrap`);
    
    console.log(submodule,pkg);
  });
}

build(getEAMDPath());
