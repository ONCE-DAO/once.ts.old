import { cpSync, existsSync, mkdirSync, renameSync } from "fs";
import { join, relative } from "path";
import simpleGit, { Options, SimpleGit, TaskOptions } from "simple-git";
import { NpmPackage } from "../NpmPackage.class";
import { Submodule } from "./Submodule.class";

type GitCloneParameter = {
  url: string;
  branch?: string;
};

export type GitRepositoryParameter = {
  baseDir?: string;
  clone?: GitCloneParameter;
  init?: boolean;
};

type Result = {
  sucess: boolean;
  errorMessage?: string;
};

export class GitRepository {
  protected gitRepo?: [SimpleGit, string];

  static get newInstance() {
    return new GitRepository();
  }

  get folderPath() {
    if (!this.gitRepo) throw new Error("TODO");
    return this.gitRepo?.[1];
  }
  async init({ baseDir, clone, init }: GitRepositoryParameter) {
    if (baseDir) {
      this.gitRepo = [simpleGit({ baseDir: baseDir, binary: "git" }), baseDir];
      clone && (await this.cloneIfNotExists(clone));
      init && this.gitRepo[0].init(["-b", "main"]);
    }
    return this;
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
    return new Promise(async (resolve) => {
      let name = this.gitRepo
        ? (await this.gitRepo[0].status()).current || undefined
        : undefined;

      resolve(name);
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

  async addSubmodule(
    repoToAdd: GitRepository,
    folderPath: string
  ): Promise<Submodule | undefined> {
    if (!this.gitRepo) throw new Error("Not Initialized");

    const submoduleFolder = join(folderPath, await repoToAdd.identifier);
    const modules = await this.gitRepo[0].subModule();
    const relativeFolderPath = relative(this.gitRepo[1], submoduleFolder);

    // check whether repo is not already added
    if (modules.indexOf(relativeFolderPath) !== -1) return;

    mkdirSync(relativeFolderPath, { recursive: true });
    cpSync(repoToAdd.folderPath, submoduleFolder, { recursive: true });

    await this.gitRepo[0].subModule([
      "add",
      "-b",
      (await repoToAdd.currentBranch) || "",
      (await repoToAdd.remoteUrl) || "",
      relativeFolderPath,
    ]);
    return Submodule.start(submoduleFolder);
  }
}
