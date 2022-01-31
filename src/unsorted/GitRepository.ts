import fs from "fs";
import path from "path";
import simpleGit, { Options, SimpleGit, TaskOptions } from "simple-git";
import { Package } from "./Package";


type GitCloneParameter = {
  url: string;
  branch?: string;
};

type Result = {
  sucess: boolean;
  errorMessage?: string;
};

export class GitRepository {
  private gitRepo?: [SimpleGit, string];

  static async start(baseDir?: string) {
    const instance = new GitRepository();
    return await instance.init(baseDir);
  }

  async init(baseDir?: string): Promise<GitRepository> {
    if (baseDir)
      this.gitRepo = [simpleGit({ baseDir: baseDir, binary: "git" }), baseDir];
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

  get exists(): boolean {
    return this.gitRepo
      ? fs.existsSync(path.join(this.gitRepo[1], ".git"))
      : false;
  }

  async updateSubmodules() {
    this.gitRepo &&
      (await this.gitRepo[0].submoduleUpdate(["--init", "--recursive"]));
  }
}
