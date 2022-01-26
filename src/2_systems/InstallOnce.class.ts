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

    const onceDevFolder = path.join(
      once.directory,
      "Components",
      "tla",
      "EAM",
      "Once",
      "dev"
    );
    fs.mkdirSync(onceDevFolder, { recursive: true });

    const currentFolder = path.basename(process.cwd());
    const currentDirectory = process.cwd();

    const options: Partial<SimpleGitOptions> = {
      baseDir: process.cwd(),
      binary: "git",
      maxConcurrentProcesses: 6,
    };
    const git: SimpleGit = simpleGit(options);

    const currentBranch = await (await git.status()).current;

    if (!currentBranch) throw new Error("Branch couldn't discover");

    const branchFolder = path.join(onceDevFolder, currentBranch);

    fs.cpSync(`../${currentFolder}`, branchFolder, {
      recursive: true,
    });
    fs.symlinkSync(branchFolder, path.join(onceDevFolder, "current"));

    // fs.rmdirSync(once.directory, { recursive: true });
    console.log("CURRENT", currentFolder);
    fs.rmSync(currentDirectory, { recursive: true });
    fs.symlinkSync(once.directory, currentDirectory);

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
