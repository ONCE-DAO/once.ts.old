import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

export class NpmPackage {
  path?: string;
  name?: string;
  version?: string;
  namespace?: string;
  linkPackage?: boolean;

  static getByFolder(path: string) {
    return this.getByPath(join(path, "package.json"));
  }

  static getByPath(path: string): NpmPackage | undefined {
    if (!existsSync(path)) return undefined;
    const npmPackage: NpmPackage = JSON.parse(readFileSync(path).toString());
    npmPackage.path = path;
    return npmPackage;
  }
}
