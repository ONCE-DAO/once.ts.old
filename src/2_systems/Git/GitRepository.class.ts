import { cpSync, existsSync, mkdirSync, renameSync } from "fs";
import { join, relative } from "path";
import simpleGit, { Options, SimpleGit, TaskOptions } from "simple-git";
import { NpmPackage } from "../NpmPackage.class";

import GitRepository, {
  GitCloneParameter,
  GitRepositoryNotInitialisedError,
  GitRepositoryParameter,
  Result,
} from "../../3_services/GitRepository.interface";
import SubmoduleInterface from "../../3_services/NewOnce/Submodule.interface";
import DefaultSubmodule from "./Submodule.class";

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
  async addSubmodule(
    repoToAdd: GitRepository,
    folderPath: string
  ): Promise<SubmoduleInterface> {
    if (!this.gitRepo) throw new Error("Not Initialized");

    const submoduleFolder = join(folderPath, await repoToAdd.identifier);
    const modules = await this.gitRepo[0].subModule();
    const relativeFolderPath = relative(this.gitRepo[1], submoduleFolder);

    // check whether repo is not already added
    if (modules.indexOf(relativeFolderPath) === -1) {
      mkdirSync(relativeFolderPath, { recursive: true });
      cpSync(repoToAdd.folderPath, submoduleFolder, { recursive: true });

      await this.gitRepo[0].subModule([
        "add",
        "-b",
        (await repoToAdd.currentBranch) || "",
        (await repoToAdd.remoteUrl) || "",
        relativeFolderPath,
      ]);
    }
    return await DefaultSubmodule.getInstance().init(submoduleFolder);
  }

  protected gitRepo?: [SimpleGit, string];

  static getInstance() {
    return new DefaultGitRepository();
  }

  get folderPath() {
    if (!this.gitRepo) throw new GitRepositoryNotInitialisedError();
    return this.gitRepo?.[1];
  }

  async getSubmodules(): Promise<SubmoduleInterface[]> {
    if (this.gitRepo) {
      const submodulePaths = (
        await this.gitRepo[0].raw(
          "config",
          "--file",
          ".gitmodules",
          "--get-regexp",
          "path"
        )
      )
        .split("\n")
        .map((x) => x.split(" ")[1])
        .filter((x) => x);

      return Promise.all(
        submodulePaths.map((path) => DefaultSubmodule.getInstance().init(path))
      );
    }
    return [];
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
