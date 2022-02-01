import path from "path/posix";
import { GitRepository } from "./GitRepository";

export class Submodule {
  static async addFromUrl(url: string, branch?: string) {
    const root = ONCE?.directory || "";
    GitRepository.start({
      baseDir: path.join(root, "tmp"),
      clone: { url, branch },
    });
    ONCE?.directory;
  }
}
