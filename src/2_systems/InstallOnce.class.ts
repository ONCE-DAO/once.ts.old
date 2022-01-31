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

    console.log("REPO INSTALLED", once.directory);

    const eamdGit: SimpleGit = simpleGit({
      baseDir: once.directory,
      binary: "git",
      maxConcurrentProcesses: 6,
    });

    const gitExists = fs.existsSync(path.join(once.directory, ".git"));

    gitExists ||
      (await eamdGit.clone(
        "https://github.com/ONCE-DAO/EAMD.ucp.git",
        once.directory,
        ["-b", "install"]
      ));
    // .init()
    // .addRemote("origin", "https://github.com/ONCE-DAO/EAMD.ucp.git")
    // .checkoutBranch("install", "origin/install")
    // .pull();

    // add again later
    // await eamdGit.removeRemote("origin")

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

    fs.existsSync(branchFolder) ||
      fs.cpSync(`../${currentDirectoryName}`, branchFolder, {
        recursive: true,
      });
    const currentFolder = path.join(onceDevFolder, "current");
    // if(fs.existsSync(currentFolder)){
    // fs.symlinkSync(branchFolder, currentFolder);
    // }

    const modules = await eamdGit.subModule();

    const relativeBranchFolder = path.relative(once.directory, branchFolder);

    if (modules.indexOf(relativeBranchFolder) === -1) {
      const foo = await eamdGit.subModule([
        "add",
        "--name",
        identifier,
        "-b",
        currentBranch,
        remoteUrl,
        path.relative(once.directory, branchFolder),
      ]);
      console.log("SUBMODULE ADDED", foo);
    } else {
      console.log("SUBMODULE ALREADY EXISTS");
    }

    await eamdGit.submoduleUpdate(["--init", "--recursive"]);
    return once;
  }

  installRootDirectory(): boolean {
    try {
      fs.mkdirSync("/EAMD.ucp");
      this.directory = "/EAMD.ucp";
      fs.existsSync(this.directory) || fs.mkdirSync(this.directory);
      this.installationMode = OnceInstallationMode.ROOT_INSTALLATION;
      return true;
    } catch (e: any) {
      // Ignore Directory is readonly e.g. mac else rethrow
      if (e.errno !== -30) throw e;
    }

    try {
      this.directory = "/var/EAMD.ucp";
      fs.existsSync(this.directory) || fs.mkdirSync(this.directory);
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
    fs.existsSync(this.directory) || fs.mkdirSync(this.directory);
    this.installationMode = OnceInstallationMode.USER_INSTALLATION;
  }
}
