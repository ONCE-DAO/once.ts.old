import { ThingStatics } from "../3_services/Thing.interface";
import { NpmPackage } from "./NpmPackage.class";
import { ClassDescriptorInterface, InterfaceDescriptorInterface } from "./Things/DefaultClassDescriptor.class";

export default class DefaultUcpComponentDescriptor {

  exportFile: string = "index.ts";

  protected static readonly _componentDescriptorStore: { [i: string]: DefaultUcpComponentDescriptor } = {};

  // TODO: specify better
  units: (ThingStatics<any> | InterfaceDescriptorInterface)[] = [];

  static getDescriptorName(packagePath: string, packageName: string, packageVersion: string | undefined) {
    return `${packagePath}${packageName}[${packageVersion || 'latest'}]`;
  }

  npmPackage!: NpmPackage;

  relativeSrcPath: string | undefined;

  identifier: string | undefined;

  protected myClass = DefaultUcpComponentDescriptor;


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


  getUnitByName(name: string, type: 'ClassDescriptor'): ClassDescriptorInterface | undefined;
  getUnitByName(name: string, type: 'InterfaceDescriptor'): InterfaceDescriptorInterface | undefined;
  getUnitByName(name: string, type: 'InterfaceDescriptor' | 'ClassDescriptor'): any {

    if (type === 'ClassDescriptor') {
      return this.units.filter(u => {
        if (u.name === name) {
          return u;
        }
      })?.[0]
    }

    if (type === 'InterfaceDescriptor') {
      return this.units.filter(u => {
        if ("allExtendedInterfaces" in u && u.name === name) {
          return u;
        }
      })?.[0]
    }


  }

  init({ path, relativePath }: UcpComponentDescriptorInitParameters) {
    (this.relativeSrcPath = relativePath);

    // TODO Deaktiviert wegen Browser
    throw new Error("To Do");
    //this.identifier = basename(relativePath);


    //@ts-ignore
    let npmPackage = NpmPackage.getByFolder(path);
    if (!npmPackage) throw new Error("Could not find a NPM Package");

    this.npmPackage = npmPackage;
    // this.name = npmPackage?.name;
    // this.version = npmPackage?.version;
    return this;
  }



  get defaultExportObject(): ThingStatics<any> | InterfaceDescriptorInterface | undefined {
    let result = this.units.filter(unit => {
      if ("classDescriptor" in unit) {
        return unit.classDescriptor.componentExport === "defaultExport"
      } else if ("allExtendedInterfaces" in unit) {
        return unit.componentExport === "defaultExport"
      }
    });
    return result?.[0];
  }



  register(object: ThingStatics<any> | InterfaceDescriptorInterface) {

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

      const descriptor = this.getDescriptor(packagePath, packageName, packageVersion);
      descriptor.register(aClass);
    }
  }

  static getDescriptor(packagePath: string, packageName: string, packageVersion: string | undefined): DefaultUcpComponentDescriptor {
    let name = this.getDescriptorName(packagePath, packageName, packageVersion);
    if (this._componentDescriptorStore[name]) return this._componentDescriptorStore[name];

    return new this().initBasics(packagePath, packageName, packageVersion)
  }

  initBasics(packagePath: string, packageName: string, packageVersion: string | undefined): DefaultUcpComponentDescriptor {

    this.npmPackage = NpmPackage.getByPackage(packagePath, packageName, packageVersion || '');
    let name = this.myClass.getDescriptorName(packagePath, packageName, packageVersion);
    this.myClass._componentDescriptorStore[name] = this;
    return this;
  }
}

export type UcpComponentDescriptorInitParameters = {
  path: string;
  relativePath: string;
};
