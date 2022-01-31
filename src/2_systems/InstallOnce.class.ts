import { AbstractOnce } from "./AbstractOnce.class";
import fs from "fs";
import os from "os";
import path from "path";
import {
  OnceInstallationMode,
  OnceMode,
  OnceState,
} from "../3_services/Once.interface";
import { GitRepository } from "../unsorted/GitRepository";

export class InstallOnce extends AbstractOnce {
  private directory: string = "";

  static async start() {
    const once = new InstallOnce();
    once.installRootDirectory() || once.installUserDirectory();
    once.mode = OnceMode.NODE_JS;
    once.state = OnceState.INITIALIZED;

    const eamdGitRepo = await GitRepository.start({
      baseDir: once.directory,
      clone: {
        url: "https://github.com/ONCE-DAO/EAMD.ucp.git",
        branch: "install",
      },
    });
    // add again later
    // eamdGitRepo.removeRemote()

    once.createDevFolder();

    const onceTsRepository = await GitRepository.start({
      baseDir: process.cwd(),
    });

    const branchFolder = await once.copyFilesToDevFolder(onceTsRepository);
    // once.createCurrentLink(branchFolder);

    eamdGitRepo.addSubmodule(onceTsRepository, branchFolder)
   
    await eamdGitRepo.updateSubmodules();
    return once;
  }

  // private createCurrentLink(branchFolder: string) {
  //   const currentFolder = path.join(this.devFolder, "current");
  //   if (!fs.existsSync(currentFolder)) {
  //     fs.symlinkSync(branchFolder, currentFolder);
  //   }
  // }
  async copyFilesToDevFolder(onceTsRepository: GitRepository) {
    const branchFolder = path.join(
      this.devFolder,
      await onceTsRepository.identifier
    );

    fs.existsSync(branchFolder) ||
      fs.cpSync(`../${this.currentDirectoryName}`, branchFolder, {
        recursive: true,
      });
    return branchFolder;
  }

  private get currentDirectoryName() {
    return path.basename(process.cwd());
  }
  private get devFolder() {
    return path.join(this.directory, "Components", "tla", "EAM", "Once", "dev");
  }
  private createDevFolder() {
    fs.mkdirSync(this.devFolder, { recursive: true });
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
