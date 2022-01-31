import { AbstractOnce } from "./AbstractOnce.class";
import fs from "fs";
import os from "os";
import path from "path";
import {
  OnceInstallationMode,
  OnceMode,
  OnceState,
} from "../3_services/Once.interface";
import simpleGit, { SimpleGit } from "simple-git";
import { GitRepository } from "../unsorted/GitRepository";

export class InstallOnce extends AbstractOnce {
  private directory: string = "";

  static async start() {
    const once = new InstallOnce();
    once.installRootDirectory() || once.installUserDirectory();
    once.mode = OnceMode.NODE_JS;
    once.state = OnceState.INITIALIZED;

    const currentDirectoryName = path.basename(process.cwd());

    const eamdGitRepo = await GitRepository.start(once.directory);
    await eamdGitRepo.cloneIfNotExists({
      url: "https://github.com/ONCE-DAO/EAMD.ucp.git",
      branch: "install",
    });
    
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

    
    const gitRepo = await GitRepository.start(process.cwd());
    const identifier = `${await gitRepo.repoName}@${ await gitRepo.currentBranch}`;
      const branchFolder = path.join(onceDevFolder, identifier);

    fs.existsSync(branchFolder) ||
      fs.cpSync(`../${currentDirectoryName}`, branchFolder, {
        recursive: true,
      });
    const currentFolder = path.join(onceDevFolder, "current");
    // if(fs.existsSync(currentFolder)){
    // fs.symlinkSync(branchFolder, currentFolder);
    // }

    // // // const modules = await eamdGit.subModule();

    // // // const relativeBranchFolder = path.relative(once.directory, branchFolder);

    // // // if (modules.indexOf(relativeBranchFolder) === -1) {
    // // //   const foo = await eamdGit.subModule([
    // // //     "add",
    // // //     "--name",
    // // //     identifier,
    // // //     "-b",
    // // //     currentBranch,
    // // //     remoteUrl,
    // // //     path.relative(once.directory, branchFolder),
    // // //   ]);
    // // //   console.log("SUBMODULE ADDED", foo);
    // // // } else {
    // // //   console.log("SUBMODULE ALREADY EXISTS");
    // // // }

    await eamdGitRepo.updateSubmodules();
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
