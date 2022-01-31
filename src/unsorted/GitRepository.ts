import fs from "fs";
import path from "path";
import simpleGit, { Options, SimpleGit, TaskOptions } from "simple-git";
import { createThis } from "typescript";
import { Package } from "./Package";

type GitCloneParameter = {
  url: string;
  branch?: string;
};

type Result = {
  sucess: boolean;
  errorMessage?: string;
};

type GitRepositoryParameter = {
  baseDir?: string;
  clone?: GitCloneParameter;
};

export class GitRepository {
  async addSubmodule(onceTsRepository: GitRepository, branchFolder: string) {
    if (!this.gitRepo) throw new Error("Not Initialized");

    const modules = await this.gitRepo[0].subModule();
    const relativeBranchFolder = path.relative(this.gitRepo[1], branchFolder);
    if (modules.indexOf(relativeBranchFolder) !== -1) return;

    await this.gitRepo[0].subModule([
      "add",
      "-b",
      (await onceTsRepository.currentBranch) || "",
      (await onceTsRepository.remoteUrl) || "",
      path.relative(this.gitRepo[1], branchFolder),
    ]);
  }
  private gitRepo?: [SimpleGit, string];

  static async start(args: GitRepositoryParameter) {
    return await new GitRepository().init(args);
  }

  async init({ baseDir, clone }: GitRepositoryParameter) {
    if (baseDir) {
      this.gitRepo = [simpleGit({ baseDir: baseDir, binary: "git" }), baseDir];
      clone && (await this.cloneIfNotExists(clone));
    }
    return this;
  }

  async clone({ url, branch }: GitCloneParameter): Promise<Result> {
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

  async cloneIfNotExists({ url, branch }: GitCloneParameter) {
    return this.exists ? { sucess: true } : await this.clone({ url, branch });
  }

  async removeRemote() {
    this.gitRepo && (await this.gitRepo[0]?.removeRemote("origin"));
  }

  async updateSubmodules() {
    this.gitRepo &&
      (await this.gitRepo[0].submoduleUpdate(["--init", "--recursive"]));
  }

  //#region Getter
  get repoName(): Promise<string | undefined> {
    return new Promise(async (resolve) => {
      if (!this.gitRepo) return undefined;
      const pkg = await Package.getByPath(
        path.join(this.gitRepo[1], "package.json")
      );
      resolve(pkg?.name);
    });
  }

  get remoteUrl(): Promise<string | undefined> {
    return new Promise(async (resolve) => {
      const remoteUrl = this.gitRepo
        ? (await this.gitRepo[0].getConfig("remote.origin.url")).value ||
          undefined
        : undefined;
      resolve(remoteUrl);
    });
  }

  get currentBranch(): Promise<string | undefined> {
    return new Promise(async (resolve) =>
      resolve(
        this.gitRepo
          ? (await this.gitRepo[0].status()).current || undefined
          : undefined
      )
    );
  }

  get identifier(): Promise<string> {
    return new Promise(async (resolve) =>
      resolve(`${await this.repoName}@${await this.currentBranch}`)
    );
  }

  get exists(): boolean {
    return this.gitRepo
      ? fs.existsSync(path.join(this.gitRepo[1], ".git"))
      : false;
  }
  //#endregion
}
