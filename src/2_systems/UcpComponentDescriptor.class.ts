import { writeFileSync } from "fs";
import { join } from "path";
import { NpmPackage } from "./NpmPackage.class";

export default class UcpComponentDescriptor {
  private npmPackage: NpmPackage | undefined;
  static getInstance() {
    return new UcpComponentDescriptor();
  }

  init(path: string) {
    this.npmPackage = NpmPackage.getByFolder(path);
    return this;
  }

  writeToPath(path: string, version: string) {
    writeFileSync(
      join(path, version, this.fileName),
      JSON.stringify(this, null, 4)
    );
  }

  get fileName() {
    return `${this.npmPackage?.name}.${this.npmPackage?.version
      ?.replace(/\./g, "_")
      .replace("/", "-")}.component.xml`;
  }
}
