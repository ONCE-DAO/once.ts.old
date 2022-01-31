// @ts-ignore
import { getPackages } from "@lerna/project";
import { execSync } from "child_process";
import simpleGit, {
  SimpleGit,
  SimpleGitOptions,
  TaskOptions,
} from "simple-git";

async function build() {
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

  // deprecated??
  await getPackages("");

  const eamdGit: SimpleGit = simpleGit({
    baseDir: process.cwd(),
    binary: "git",
    maxConcurrentProcesses: 6,
  });
  const submodules = await (
    await eamdGit.raw("config", "--file", ".gitmodules", "--get-regexp", "path")
  )
    .split("\n")
    .map((x) => x.split(" ")[1])
    .filter((x) => x);

  submodules.forEach((submodule) => {
    
  });
  // console.log("CONFIG", (await (await eamdGit.listConfig("worktree")).all));
  // console.log("STATUS",await eamdGit.subModule(["status","Components/tla/EAM/Once/dev/once.ts@install"]));
}

build();
