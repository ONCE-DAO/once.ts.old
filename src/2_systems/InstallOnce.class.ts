import { AbstractOnce } from "./AbstractOnce.class";
import fs from "fs";
import os from "os";
import path from "path";
import {
  OnceInstallationMode,
  OnceMode,
  OnceState,
} from "../3_services/Once.interface";
import simpleGit, {
  Options,
  SimpleGit,
  SimpleGitOptions,
  TaskOptions,
} from "simple-git";

export class InstallOnce extends AbstractOnce {
  private directory: string = "";

  static async start() {
    console.log("WORKING", process.cwd());

    const once = new InstallOnce();
    once.installRootDirectory() || once.installUserDirectory();
    once.mode = OnceMode.NODE_JS;
    once.state = OnceState.INITIALIZED;

    const currentDirectoryName = path.basename(process.cwd());
    // const currentDirectory = process.cwd();

    const eamdGit: SimpleGit = simpleGit({
      baseDir: once.directory,
      binary: "git",
      maxConcurrentProcesses: 6,
    });
    console.log(once.directory);
    await eamdGit.clone(
      "https://github.com/ONCE-DAO/EAMD.ucp.git",
      once.directory,
      ['-b','install']
    );
    // .init()
    // .addRemote("origin", "https://github.com/ONCE-DAO/EAMD.ucp.git")
    // .checkoutBranch("install", "origin/install")
    // .pull();

    const onceDevFolder = path.join(
      once.directory,
      "Components",
      "tla",
      "EAM",
      "Once",
      "dev"
    );
    fs.mkdirSync(onceDevFolder, { recursive: true });

    const git: SimpleGit = simpleGit({
      baseDir: process.cwd(),
      binary: "git",
      maxConcurrentProcesses: 6,
    });
    const remoteUrl =
      (await (await git.getConfig("remote.origin.url")).value) || "";
    console.log(remoteUrl);

    const repoName = path.basename(remoteUrl, ".git");

    const currentBranch = await (await git.status()).current;

    if (!currentBranch) throw new Error("Branch couldn't discover");
    const identifier = `${repoName}@${currentBranch}`;

    const branchFolder = path.join(onceDevFolder, identifier);

    fs.cpSync(`../${currentDirectoryName}`, branchFolder, {
      recursive: true,
    });
    const currentFolder = path.join(onceDevFolder, "current");
    fs.symlinkSync(branchFolder, currentFolder);
    // fs.symlinkSync(
    //   path.join(currentFolder, "eamd-package.json"),
    //   path.join(once.directory, "package.json")
    // );
    // fs.symlinkSync(
    //   path.join(currentFolder, ".gitignore"),
    //   path.join(once.directory, ".gitignore")
    // );

    console.log("SUBMODULE");
    // const foo = await eamdGit.submoduleAdd(remoteUrl, branchFolder);
    const foo = await eamdGit.subModule([
      "add",
      "--name",
      identifier,
      "-b",
      currentBranch,
      remoteUrl,
      path.relative(once.directory, branchFolder),
    ]);
    // const f:any = {}
    // f.add=null
    // f['--name']="testname"
    // f[remoteUrl]=null
    // f[branchFolder]=null
    // const foo = await eamdGit.subModule(f)

    //  await eamdGit.submoduleUpdate(bra   kc nchFolder, "--branch":"test"})
    // .submoduleUpdate(subModuleName, [options])
    // "--name":"testsub", "--branch":"main",
    // const foo = await eamdGit.subModule({"add":null,{remoteUrl:branchFolder}})
    console.log("SUBMODULE OK", foo);

    // console.log("CURRENT", currentDirectoryName);
    // fs.rmSync(currentDirectory, { recursive: true });
    // fs.symlinkSync(once.directory, currentDirectory);

    return once;
  }

  installRootDirectory(): boolean {
    try {
      fs.mkdirSync("/EAMD.ucp");
      this.directory = "/EAMD.ucp";
      this.installationMode = OnceInstallationMode.ROOT_INSTALLATION;
      return true;
    } catch (e: any) {
      // Ignore Directory is readonly e.g. mac else rethrow
      if (e.errno !== -30) throw e;
    }

    try {
      fs.mkdirSync("/var/EAMD.ucp");
      this.directory = "/var/EAMD.ucp";
      this.installationMode = OnceInstallationMode.ROOT_INSTALLATION;
      return true;
    } catch (e: any) {
      // No access (root permissions)
      if (e.errno === -13) return false;
      throw e;
    }
  }

  installUserDirectory() {
    const user = os.userInfo();
    this.directory = path.join(user.homedir, "EAMD.ucp");
    fs.mkdirSync(this.directory);
    this.installationMode = OnceInstallationMode.USER_INSTALLATION;
  }
}
