import path from "path/posix";
import { GitRepository } from "./GitRepository";
import fs from "fs";
import { Package } from "./Package";
import { OnceBuilder } from "./OnceBuilder.class";
import { execSync } from "child_process";
export class Submodule {
  static async addFromUrl(
    url: string,
    branch?: string,
    overwrite?: { name: string; namespace: string }
  ) {
    // const root = ONCE?.directory || "";
    const root = "/Users/philippbartels/EAMD.ucp";
    const tmpFolder = path.join(root, "tmp");
    !fs.existsSync(tmpFolder) && fs.mkdirSync(tmpFolder);

    const repo = await GitRepository.start({
      baseDir: path.join(root, "tmp"),
      clone: { url, branch },
    });

    const pkg = await Package.getByPath(path.join(tmpFolder, "package.json"));
    execSync(`npm install --prefix ${tmpFolder}`);
    if (overwrite && pkg) {
      pkg.name = overwrite.name;
      pkg.namespace = overwrite.namespace;
      fs.writeFileSync(
        path.join(tmpFolder, "package.json"),
        JSON.stringify(pkg, null, 2)
      );
    }

    const split = pkg?.namespace?.split(".");
    const packageFolder = split ? split : ["empty"];
    const componentFolder = path.join(
      root,
      "Components",
      ...packageFolder,
      pkg?.name || path.basename(url, ".git"),
      "dev"
    );
    fs.mkdirSync(componentFolder, { recursive: true });
    const newBase = path.join(componentFolder, await repo.identifier);
    fs.renameSync(tmpFolder, newBase);
    await repo.init({ baseDir: newBase });

    const rootRepo = await GitRepository.start({ baseDir: root });
    rootRepo.addSubmodule(repo, newBase);
    OnceBuilder.buildSubmodule(newBase);
  }
}
