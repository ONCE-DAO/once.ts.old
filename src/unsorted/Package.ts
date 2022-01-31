import fs from "fs";
export class Package {
  name?: string;
  version?: string;
  namespace?: string;

  static async getByPath(path: string): Promise<Package | undefined> {
    if (!fs.existsSync(path)) return undefined;
    return JSON.parse(fs.readFileSync(path).toString());
  }
}
