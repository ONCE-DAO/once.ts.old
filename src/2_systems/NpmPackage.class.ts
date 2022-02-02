import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

export class NpmPackage {
  path?: string;
  name?: string;
  version?: string;
  namespace?: string;

  static getByFolder(path: string) {
    return this.getByPath(join(path, "package.json"));
  }

  static getByPath(path: string): NpmPackage | undefined {
    if (!existsSync(path)) return undefined;
    const npmPackage: NpmPackage = JSON.parse(readFileSync(path).toString());
    npmPackage.path = path;
    return npmPackage;
  }

//   save(path?: string) {
//     const file = path || this.path;
//     if (!file) throw new Error("could not save package because no path");
//     const obj = JSON.parse(JSON.stringify(this));
//     delete obj.path;
//     writeFileSync(file, JSON.stringify(obj, null, 2), { flag: "w+" });
//   }

 
}
