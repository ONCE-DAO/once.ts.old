import fs, { cpSync, existsSync, fstat, mkdirSync, renameSync } from "fs";
import { join, relative } from "path";
import simpleGit, { Options, SimpleGit, TaskOptions } from "simple-git";
import { NpmPackage } from "../NpmPackage.class";

import GitRepository, {
  GitCloneParameter,
  GitRepositoryNotInitialisedError,
  GitRepositoryParameter,
  Result,
} from "../../3_services/GitRepository.interface";
import SubmoduleInterface from "../../3_services/Submodule.interface";
import DefaultSubmodule from "./Submodule.class";
import { EAMD_FOLDERS } from "../../3_services/EAMD.interface";
import IOR from "../../3_services/IOR.interface";

export default class DefaultGitRepository implements GitRepository {
  async init({
    baseDir,
    clone,
    init,
  }: GitRepositoryParameter): Promise<GitRepository> {
    if (baseDir) {
      this.gitRepo = [simpleGit({ baseDir: baseDir, binary: "git" }), baseDir];
      clone && (await this.cloneIfNotExists(clone));
      init && this.gitRepo[0].init(["-b", "main"]);
    }
    return this;
  }
  async addSubmodule(repoToAdd: GitRepository): Promise<SubmoduleInterface> {
    if (!this.gitRepo) throw new Error("Not Initialized");

    const devFolder = join(
      this.gitRepo[1],
      DefaultGitRepository.getdevFolder(repoToAdd)
    );
    const submoduleFolder = join(devFolder, await repoToAdd.identifier);
    const modules = await this.gitRepo[0].subModule();
    const relativeFolderPath = relative(this.gitRepo[1], submoduleFolder);

    // check whether repo is not already added
    if (modules.indexOf(relativeFolderPath) === -1) {
      mkdirSync(join(this.gitRepo[1], relativeFolderPath), { recursive: true });
      cpSync(repoToAdd.folderPath, submoduleFolder, { recursive: true });

      await this.gitRepo[0].subModule([
        "add",
        "-b",
        (await repoToAdd.currentBranch) || "",
        (await repoToAdd.remoteUrl) || "",
        relativeFolderPath,
      ]);
    }
    return await DefaultSubmodule.getInstance().init({
      path: relativeFolderPath,
    });
  }

  protected gitRepo?: [SimpleGit, string];

  private static getdevFolder(repo: GitRepository) {
    const npmPackage = NpmPackage.getByFolder(repo.folderPath);
    if (!npmPackage) throw new Error("TODO");

    const split = npmPackage.namespace?.split(".");
    const packageFolder = split ? split : [EAMD_FOLDERS.MISSING_NAMESPACE];

    return join(
      EAMD_FOLDERS.COMPONENTS,
      ...packageFolder,
      npmPackage.name || "",
      EAMD_FOLDERS.DEV
    );
  }
  static getInstance() {
    return new DefaultGitRepository();
  }

  get folderPath() {
    if (!this.gitRepo) throw new GitRepositoryNotInitialisedError();
    return this.gitRepo?.[1];
  }

  async getSubmodules(): Promise<SubmoduleInterface[]> {
    if (this.gitRepo) {
      let repoParameter: {
        [index: string]: { path?: string; url?: string; branch?: string };
      } = {};
      const submodulePaths = (
        await this.gitRepo[0].raw("config", "--file", ".gitmodules", "-l")
      )
        .split("\n")
        .filter((l) => l)
        .forEach((l) => {
          let splitLine = l.match(/^(.+)\.(.+)=(.+)$/);
          if (!splitLine) throw new Error("Could not parse line: " + l);

          repoParameter[splitLine[1]] = repoParameter[splitLine[1]] || {};
          // @ts-ignore
          repoParameter[splitLine[1]][splitLine[2]] = splitLine[3];
        });

      return Promise.all(
        Object.keys(repoParameter).map((key) =>
          DefaultSubmodule.getInstance().init(repoParameter[key])
        )
      );
    }
    return [];
  }

  async getAndInstallSubmodule(
    ior: IOR,
    url: string
  ): Promise<SubmoduleInterface> {
    const submodules = await this.getSubmodules();
    const path = url + "@" + (ior.namespaceVersion || "main");
    if (ior.namespace === undefined) throw new Error("Missing Namespace");
    let namespace = ior.namespace;
    const existingSubmodule = submodules.filter((x) => x.url?.includes(url));
    if (existingSubmodule.length > 0) {
      return existingSubmodule[0];
    }

    const once = global.ONCE;
    if (!once) throw new Error("Missing ONCE");
    return await DefaultSubmodule.addFromRemoteUrl({
      url: url,
      once,
    });
  }

  private async clone({ url, branch }: GitCloneParameter): Promise<Result> {
    if (!this.gitRepo)
      return {
        sucess: false,
        errorMessage: "cannot clone repository without basedir or target path",
      };

    const options: TaskOptions<Options> = [];
    branch && options.push("-b", branch);
    const result = await this.gitRepo[0].clone(url, this.gitRepo[1], options);
    // TODO error handling™
    return { sucess: true };
  }

  private async cloneIfNotExists({ url, branch }: GitCloneParameter) {
    return this.exists ? { sucess: true } : await this.clone({ url, branch });
  }

  private get exists(): boolean {
    return this.gitRepo ? existsSync(join(this.gitRepo[1], ".git")) : false;
  }

  get remoteUrl(): Promise<string> {
    return new Promise(async (resolve) => {
      const remoteUrl = this.gitRepo
        ? (await this.gitRepo[0].getConfig("remote.origin.url")).value ||
          undefined
        : undefined;
      resolve(remoteUrl || "");
    });
  }

  get currentBranch(): Promise<string> {
    return new Promise(async (resolve) => {
      let name = this.gitRepo
        ? (await this.gitRepo[0].status()).current || undefined
        : undefined;

      resolve(name || "");
    });
  }

  get repoName(): Promise<string | undefined> {
    return new Promise(async (resolve) => {
      if (!this.gitRepo) return undefined;
      const pkg = await NpmPackage.getByFolder(this.gitRepo[1]);
      resolve(pkg?.name);
    });
  }

  get identifier(): Promise<string> {
    return new Promise(async (resolve) =>
      resolve(
        `${await this.repoName}@${(await this.currentBranch)?.replace(
          "/",
          "-"
        )}`
      )
    );
  }
}
