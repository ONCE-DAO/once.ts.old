import { mkdirSync, rm, rmSync } from "fs";
import { join } from "path/posix";
import GitRepository from "../../../src/2_systems/Git/GitRepository.class";
import { GitRepositoryConstants, GitRepositoryNotInitialisedError } from "../../../src/3_services/NewOnce/GitRepository.interface";

let gitRepository: GitRepository;
beforeEach(() => {
  gitRepository = GitRepository.getInstance();
  expect(gitRepository).not.toBeUndefined();
  expect(gitRepository).not.toBeNull();
});

test("unitializedFolderPath", async () => {
  const unitializedFolderPath = () => gitRepository.folderPath;
  expect(unitializedFolderPath).toThrow(GitRepositoryNotInitialisedError);
  expect(unitializedFolderPath).toThrowError(
    GitRepositoryConstants.NOTINITIALIZED
  );
});

test("itializedFolderPath", async () => {
  const baseDir = join(process.cwd(), "tmp");
  mkdirSync(baseDir);
  try {
    gitRepository.init({ baseDir });
    const intializedFolderPath = gitRepository.folderPath;
    expect(intializedFolderPath).toEqual(baseDir);
  } finally {
    rmSync(baseDir, { recursive: true, force: true });
  }
});
