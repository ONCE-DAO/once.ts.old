import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { create } from "xmlbuilder2";
import { ThingStatics } from "../3_services/Thing.interface";
import { ClassDescriptorInterface, InterfaceDescriptorInterface } from "./Things/DefaultClassDescriptor.class";

import fs from 'fs';
import path from 'path';
import DefaultUcpComponentDescriptor, { UcpComponentDescriptorInitParameters } from "./DefaultUcpComponentDescriptor.class";
import { ServerSideNpmPackage } from "./ServerSideNpmPackage.class";


export default class ServerSideUcpComponentDescriptor extends DefaultUcpComponentDescriptor {

  exportFile: string = "index.ts";

  protected myClass = ServerSideUcpComponentDescriptor;


  // HACK Keine ahnung warum er das ! nicht akzeptiert
  // @ts-ignore
  npmPackage!: ServerSideNpmPackage;

  init({ path, relativePath }: UcpComponentDescriptorInitParameters) {
    (this.relativeSrcPath = relativePath);

    // TODO Deaktiviert wegen Browser
    //this.identifier = basename(relativePath);


    let npmPackage = ServerSideNpmPackage.getByFolder(path) as ServerSideNpmPackage;
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

  get defaultExportObject(): ThingStatics<any> | InterfaceDescriptorInterface | undefined {
    let result = this.units.filter(unit => {
      if ("classDescriptor" in unit) {
        return unit.classDescriptor.componentExport === "defaultExport"
      } else if (unit) {
        return unit.componentExport === "defaultExport"
      }
    });
    return result?.[0];
  }

  private _getInterfaceExportName(fileName: string, interfaceName: string, fileData?: string): string {
    if (!fileData) {
      if (!fs.existsSync(fileName)) {
        throw new Error(`File '${fileName}' doesn't exist`);
      }

      fileData = readFileSync(fileName).toString();
    }

    let regex = new RegExp(`export (default)? ?(interface )?({[^}*])?${interfaceName}`, "m");
    let matchResult = fileData.match(regex);
    if (matchResult) {
      if (matchResult[1] === "default") {
        return "default";
      } else {
        return interfaceName;
      }
    }
    throw new Error(`Could not find the interface ${interfaceName} in file '${fileName}'`);

  }

  async createExportFile() {
    let files = this.npmPackage.discoverFiles(['*.ts']).filter(f => f.match(/(class|interface)\.ts$/)).sort();

    let baseDirectory = this.npmPackage.localBaseDir;

    let exportList: string[] = [];
    let defaultExport: string = "";
    let fd = fs.openSync(baseDirectory + `/${this.exportFile}`, 'w', 0o666);

    const defaultFile = baseDirectory + "/index.default.ts";
    if (fs.existsSync(defaultFile)) {
      let defaultData = readFileSync(defaultFile).toString();
      fs.writeSync(fd, "// ########## Default Export ##########\n");
      fs.writeSync(fd, defaultData);
      fs.writeSync(fd, "\n// ########## Default Export END ##########\n\n");

    }

    fs.writeSync(fd, "// ########## Generated Export ##########\n");


    for (const file of files) {
      // HACK Keine Ahnung warum .js gebraucht wird.
      const fileImport = baseDirectory + file.replace(/\.ts$/, '');
      const moduleFile = path.relative(baseDirectory, fileImport);

      let importedModule = await import(fileImport);
      if (importedModule) {
        let exportedModuleItems = { ...importedModule };
        for (const itemKey of Object.keys(exportedModuleItems)) {
          let item = exportedModuleItems[itemKey];
          let descriptor: InterfaceDescriptorInterface | ClassDescriptorInterface | undefined;
          if ("allExtendedInterfaces" in item) {
            descriptor = item as InterfaceDescriptorInterface;

          } else if ("classDescriptor" in item && item.classDescriptor) {
            descriptor = item.classDescriptor as ClassDescriptorInterface;
          }

          if (descriptor && descriptor.componentExport && descriptor.componentExportName) {

            let line = "import ";
            line += itemKey === "default" ? descriptor.componentExportName : `{ ${itemKey} } `;
            line += ` from "./${moduleFile}";\n`

            fs.writeSync(fd, line);

            // Import Real Interface
            if ("allExtendedInterfaces" in item) {
              let exportName = this._getInterfaceExportName(baseDirectory + file, item.name);

              let interfaceLine = "import ";
              interfaceLine += exportName === "default" ? item.name : `{ ${exportName} } `;
              interfaceLine += ` from "./${moduleFile}";\n`
              exportList.push(item.name);
              fs.writeSync(fd, interfaceLine);

            }

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

  static readFromFile(path: string): DefaultUcpComponentDescriptor {
    return JSON.parse(readFileSync(path).toString());
  }

  get fileName() {
    return `${this.name}.${this.version
      ?.replace(/\./g, "_")
      .replace("/", "-")}.component.xml`;
  }


}

