import { AbstractOnce } from "../2_systems/AbstractOnce.class";
import fs from "fs";
import os from "os";
import path from "path";
import {
  OnceInstallationMode,
  OnceMode,
  OnceState,
} from "../3_services/Once.interface";
import { GitRepository } from "./GitRepository";
import { OnceBuilder } from "./OnceBuilder.class";

export class OnceInstaller extends AbstractOnce {
  static async start() {
    const once = new OnceInstaller();
    once.installRootDirectory() || once.installUserDirectory();
    once.mode = OnceMode.NODE_JS;
    once.state = OnceState.INITIALIZED;

    const eamdGitRepo = await GitRepository.start({
      baseDir: once.directory,
      init: true,
    });
    once.addInitialFiles(eamdGitRepo);

    // add again later
    // eamdGitRepo.removeRemote()

    once.createDevFolder();
    const onceTsRepository = await GitRepository.start({
      baseDir: process.cwd(),
    });
    const branchFolder = await once.copyFilesToDevFolder(onceTsRepository);
    await eamdGitRepo.addSubmodule(onceTsRepository, branchFolder);
    await eamdGitRepo.commitAll("ONCE installed EAMD.ucp on your machine");
    await eamdGitRepo.updateSubmodules();

    OnceBuilder.buildSubmodule(branchFolder);
    return once;
  }

  private addInitialFiles(eamdGitRepo: GitRepository) {
    fs.writeFileSync(
      path.join(this.directory || "", "package.json"),
      JSON.stringify(
        {
          name: "eamd.ucp",
          version: "0.0.1",
          scripts: {
            start:
              "npm --prefix Components/tla/EAM/Once/dist/current run start",
          },
        },
        null,
        2
      ),
      { encoding: "utf8", flag: "w+" }
    );
    fs.writeFileSync(path.join(this.directory || "", ".gitignore"), `dist`, {
      encoding: "utf8",
      flag: "w+",
    });
    const currentDirectory = process.cwd();
    fs.cpSync(
      path.join(currentDirectory, ".vscode"),
      path.join(this.directory || "", ".vscode"),
      { recursive: true }
    );
    fs.cpSync(
      path.join(currentDirectory, ".npmrc"),
      path.join(this.directory || "", ".npmrc"),
      { recursive: true }
    );
  }

  private async copyFilesToDevFolder(onceTsRepository: GitRepository) {
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
    return path.join(
      this.directory || "",
      "Components",
      "tla",
      "EAM",
      "Once",
      "dev"
    );
  }

  private createDevFolder() {
    fs.mkdirSync(this.devFolder, { recursive: true });
  }

  private installRootDirectory(): boolean {
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

  private installUserDirectory() {
    const user = os.userInfo();
    this.directory = path.join(user.homedir, "EAMD.ucp");
    fs.existsSync(this.directory) || fs.mkdirSync(this.directory);
    this.installationMode = OnceInstallationMode.USER_INSTALLATION;
  }
}
