import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

import fs from 'fs';
import path from 'path';
export class NpmPackage {

  private static _store: { [index: string]: NpmPackage } = {};
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

  static getByPackage(path: string, name: string, version: string): NpmPackage {
    const nameString = `${path}.${name}[${version}]`
    let npmPackageInstance = this._store[nameString];

    if (npmPackageInstance === undefined) {

      npmPackageInstance = new NpmPackage().init(path, name, version);
      this._store[nameString] = npmPackageInstance;
    }
    return npmPackageInstance
  }

  init(path: string, name: string, version: string) {
    this.path = path;
    this.name = name;
    this.version = version;
    return this;
  }

  get localBaseDir(): string {
    // HACK Change with real Components
    return process.cwd() + '/src';
  }

  discoverFiles(fileTypes: string[]): string[] {

    if (!this.path) throw new Error("Missing path")
    let dir = this.localBaseDir;

    let filesToReturn: string[] = [];
    function walkDir(currentPath: string) {
      let files = fs.readdirSync(currentPath);
      for (let i in files) {
        let curFile = path.join(currentPath, files[i]);
        if (fs.statSync(curFile).isFile()) {
          filesToReturn.push(curFile.replace(dir, ''));
        } else if (fs.statSync(curFile).isDirectory()) {
          walkDir(curFile);
        }
      }
    };
    walkDir(dir);
    return filesToReturn;

  }
}
