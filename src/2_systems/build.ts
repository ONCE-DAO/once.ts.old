import { execSync } from "child_process";
import { GitRepository } from "../unsorted/GitRepository";

export async function build() {
  console.log(process.argv);
  if (!process.argv.includes("--fast")) {
    console.log("Remove all node_modules");
    execSync("npm run lerna:clean");
    execSync("rm -rf node_modules");
    console.log("all node_modules removed");

    console.log("install npm packages again");
    execSync("npm  install");
    console.log("packages installed");
  }

  console.log("install all sub dependencies using lerna");
  execSync("npm run lerna:bootstrap");
  console.log("all node_modules installed recursive");
  const eamdRepository = await GitRepository.start({ baseDir: process.cwd() });

  // (await eamdRepository.submodules).forEach((submodule) => {
  //   console.log(submodule);

  // });
  // console.log("CONFIG", (await (await eamdGit.listConfig("worktree")).all));
  // console.log("STATUS",await eamdGit.subModule(["status","Components/tla/EAM/Once/dev/once.ts@install"]));
}


build();
