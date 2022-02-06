import Submodule from "./Submodule.interface";

export default interface GitRepository {
  identifier: Promise<string>;
  folderPath: string;
  currentBranch: Promise<string>;
  remoteUrl: Promise<string>;

  addSubmodule(
    repoToAdd: GitRepository,
    folderPath: string
  ): Promise<Submodule>;
  getSubmodules(): Promise<Submodule[]>;
  init({
    baseDir,
    clone,
    init,
  }: GitRepositoryParameter): Promise<GitRepository>;
}

export class GitRepositoryConstants {
  static readonly NOTINITIALIZED = "GitRepository wasn't initalized";
}
export class GitRepositoryNotInitialisedError extends Error {
  constructor() {
    super(GitRepositoryConstants.NOTINITIALIZED);
  }
}
export type GitCloneParameter = {
  url: string;
  branch?: string;
};

export type GitRepositoryParameter = {
  baseDir?: string;
  clone?: GitCloneParameter;
  init?: boolean;
};

export type Result = {
  sucess: boolean;
  errorMessage?: string;
};
