import { readFileSync, writeFileSync } from "fs";
import { basename, join } from "path";
import { NpmPackage } from "./NpmPackage.class";
import { create } from "xmlbuilder2";
import Thing from "../3_services/Thing.interface";
import ClassDescriptor, { InterfaceDescriptor } from "./Things/DefaultClassDescriptor.class";

import fs from 'fs';
import path from 'path';


export default class UcpComponentDescriptor {

  private static readonly _componentDescriptorStore: { [i: string]: UcpComponentDescriptor } = {};

  // TODO: specify better
  units: any[] = [];

  static getDescriptorName(packagePath: string, packageName: string, packageVersion: string | undefined) {
    return `${packagePath}${packageName}[${packageVersion || 'latest'}]`;
  }

  npmPackage!: NpmPackage;

  relativeSrcPath: string | undefined;

  identifier: string | undefined;
  static getInstance() {
    return new UcpComponentDescriptor();
  }

  get name(): string {
    if (!this.npmPackage.name) throw new Error("NPM Name is missing");
    return this.npmPackage.name;
  }

  get version(): string {
    if (!this.npmPackage.version) throw new Error("NPM version is missing");
    return this.npmPackage.version;
  }

  get srcPath(): string {
    if (!this.npmPackage.path) throw new Error("NPM version is missing");
    return this.npmPackage.path;
  }


  getUnitByName(name: string, type: 'ClassDescriptor'): ClassDescriptor | undefined;
  getUnitByName(name: string, type: 'InterfaceDescriptor'): InterfaceDescriptor | undefined;
  getUnitByName(name: string, type: 'InterfaceDescriptor' | 'ClassDescriptor'): any {

    if (type === 'ClassDescriptor') {
      return this.units.filter(u => {
        if (u instanceof ClassDescriptor && u.name === name) {
          return u;
        }
      })?.[0]
    }

    if (type === 'InterfaceDescriptor') {
      return this.units.filter(u => {
        if (u instanceof InterfaceDescriptor && u.name === name) {
          return u;
        }
      })?.[0]
    }


  }

  init({ path, relativePath }: UcpComponentDescriptorInitParameters) {
    (this.relativeSrcPath = relativePath);
    this.identifier = basename(relativePath);


    let npmPackage = NpmPackage.getByFolder(path);
    if (!npmPackage) throw new Error("Could not find a NPM Package");

    this.npmPackage = npmPackage;
    // this.name = npmPackage?.name;
    // this.version = npmPackage?.version;
    return this;
  }

  writeToPath(path: string, version: string) {
    const descriptor = create();
    descriptor.ele("", "foo").txt("vbhjk").up();
    // Object.keys(this).forEach((key, i) => {
    //   //@ts-ignore
    //   const value = this[key];
    //   // value && console.log(value.toString());
    //   descriptor.ele("", key).txt(value.toString()).up();
    //   // value && descriptor.att(key, value.toString())
    // });
    // const xml = descriptor.end({ prettyPrint: true });
    // console.log("DESCRIPTOR", xml);
    writeFileSync(
      join(path, version, this.fileName),
      descriptor.end({ prettyPrint: true })
    );
  }



  async createExportFile() {
    let files = this.npmPackage.discoverFiles(['*.ts']).filter(f => f.match(/(class|interface)\.ts$/)).sort();

    let baseDirectory = this.npmPackage.localBaseDir;

    let exportList: string[] = [];
    let defaultExport: string = "";
    let fd = fs.openSync(baseDirectory + "/index.ts", 'w', 0o666);

    const defaultFile = baseDirectory + "/index.default.ts";
    if (fs.existsSync(defaultFile)) {
      let defaultData = readFileSync(defaultFile).toString();
      fs.writeSync(fd, "// ########## Default Export ##########\n");
      fs.writeSync(fd, defaultData);
      fs.writeSync(fd, "\n// ########## Default Export END ##########\n\n");

    }

    fs.writeSync(fd, "// ########## Generated Export ##########\n");


    for (const file of files) {
      const fileImport = baseDirectory + file.replace(/\.ts$/, '');
      const moduleFile = path.relative(baseDirectory, fileImport);

      let importedModule = await import(fileImport);
      if (importedModule) {
        let exportedModuleItems = { ...importedModule };
        for (const itemKey of Object.keys(exportedModuleItems)) {
          let item = exportedModuleItems[itemKey];
          let descriptor: InterfaceDescriptor | ClassDescriptor | undefined;
          if (item instanceof InterfaceDescriptor) {
            descriptor = item as InterfaceDescriptor;

          } else if ("classDescriptor" in item && item.classDescriptor) {
            descriptor = item.classDescriptor as ClassDescriptor;
          }

          if (descriptor && descriptor.componentExport && descriptor.componentExportName) {

            let line = "import ";
            line += itemKey === "default" ? descriptor.componentExportName : `{ ${itemKey} } `;
            line += ` from "./${moduleFile}";\n`

            fs.writeSync(fd, line);

            if (descriptor.componentExport === "defaultExport") {
              defaultExport = descriptor.componentExportName;
            } else {
              exportList.push(descriptor.componentExportName);
            }

          }
        }
      }
    }


    if (defaultExport) {
      let line = `export default ${defaultExport};\n`
      fs.writeSync(fd, line);
    }
    if (exportList.length > 0) {
      let line = `export {${exportList.join(', ')}};\n`
      fs.writeSync(fd, line);
    }

    fs.writeSync(fd, "// ########## Generated Export END ##########\n");

    fs.closeSync(fd);

  }

  static readFromFile(path: string): UcpComponentDescriptor {
    return JSON.parse(readFileSync(path).toString());
  }

  get fileName() {
    return `${this.name}.${this.version
      ?.replace(/\./g, "_")
      .replace("/", "-")}.component.xml`;
  }

  register(object: Thing<any> | InterfaceDescriptor) {

    if ("classDescriptor" in object) {
      this.units.push(object);

      object.classDescriptor.add(this);

    } else if ("implementedInterfaces" in object) {
      const existingInterfaceDescriptors = this.getUnitByName(object.name, "InterfaceDescriptor");
      if (existingInterfaceDescriptors) {
        throw new Error(`Duplicated Interface '${object.name}' in UcpComponent ${this.name}`);
      }
      this.units.push(object);

      object.add(this);

    }
  }

  static register(packagePath: string, packageName: string, packageVersion: string | undefined): Function {
    return (aClass: any, name: string, x: any): void => {

      const descriptor = UcpComponentDescriptor.getDescriptor(packagePath, packageName, packageVersion);
      descriptor.register(aClass);
    }
  }

  static getDescriptor(packagePath: string, packageName: string, packageVersion: string | undefined): UcpComponentDescriptor {
    let name = this.getDescriptorName(packagePath, packageName, packageVersion);
    if (this._componentDescriptorStore[name]) return this._componentDescriptorStore[name];

    return new UcpComponentDescriptor().initBasics(packagePath, packageName, packageVersion)
  }
  initBasics(packagePath: string, packageName: string, packageVersion: string | undefined): UcpComponentDescriptor {

    this.npmPackage = NpmPackage.getByPackage(packagePath, packageName, packageVersion || '');
    let name = UcpComponentDescriptor.getDescriptorName(packagePath, packageName, packageVersion);
    UcpComponentDescriptor._componentDescriptorStore[name] = this;
    return this;
  }
}

type UcpComponentDescriptorInitParameters = {
  path: string;
  relativePath: string;
};
