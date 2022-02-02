import { cpSync, writeFileSync } from "fs";
import { join } from "path";
import { GitRepository, GitRepositoryParameter } from "./GitRepository.class";

export class EAMDGitRepository extends GitRepository {
  static get getInstance() {
    return new EAMDGitRepository();
  }

  async init({ baseDir, clone, init }: GitRepositoryParameter) {
    const repository = super.init({ baseDir, clone, init });
    this.addPackageJson();
    this.addGitIgnore();
    // this.copy(process.cwd(), ".vscode");
    // this.copy(process.cwd(), ".npmrc");
    return this;
  }

  async rebuildAllSubmodules() {
    (await this.getSubmodules()).forEach((submodule) => {
      submodule.path = join(this.folderPath, submodule.path || "");
      console.log("REBUILD:",submodule.path);
      
      submodule.build();
    });
  }

  private copy(currentFolder: string, folder: string) {
    if (!this.gitRepo) throw new Error("not init ...");

    cpSync(join(currentFolder, folder), join(this.gitRepo[1], folder), {
      recursive: true,
    });
  }

  private addGitIgnore() {
    if (!this.gitRepo) throw new Error("not init ...");

    writeFileSync(join(this.gitRepo[1], ".gitignore"), `dist`, {
      encoding: "utf8",
      flag: "w+",
    });
  }

  private addPackageJson() {
    if (!this.gitRepo) throw new Error("not init ...");

    writeFileSync(
      join(this.gitRepo[1], "package.json"),
      JSON.stringify(
        {
          name: "eamd.ucp",
          version: "0.0.1",
          scripts: {
            start:
              "npm --prefix Components/tla/EAM/once.ts/dist/current run start",
            "start:no-loader":
              "npm --prefix Components/tla/EAM/once.ts/dist/current run start:no-loader",
          },
        },
        null,
        2
      ),
      { encoding: "utf8", flag: "w+" }
    );
  }
}
