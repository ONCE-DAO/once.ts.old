import { readFileSync, writeFileSync } from "fs";
import { basename, join } from "path";
import { NpmPackage } from "./NpmPackage.class";
import { create } from "xmlbuilder2";
import ClassDescriptor from "./Things/DefaultClassDescriptor.class";
import Thing from "../3_services/Thing.interface";

export default class UcpComponentDescriptor {

  private static readonly _componentDescriptorStore: { [i: string]: UcpComponentDescriptor } = {};

  // TODO: specify better
  units: any[] = [];

  static getDescriptorName(packagePath: string, packageName: string, packageVersion: string | undefined) {
    return `${packagePath}${packageName}[${packageVersion || 'latest'}]`;
  }

  srcPath: string | undefined;
  relativeSrcPath: string | undefined;
  name: string | undefined;
  version: string | undefined;
  identifier: string | undefined;
  static getInstance() {
    return new UcpComponentDescriptor();
  }

  init({ path, relativePath }: UcpComponentDescriptorInitParameters) {
    (this.srcPath = path), (this.relativeSrcPath = relativePath);
    this.identifier = basename(relativePath);
    let npmPackage = NpmPackage.getByFolder(this.srcPath);
    this.name = npmPackage?.name;
    this.version = npmPackage?.version;
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

  static readFromFile(path: string): UcpComponentDescriptor {
    return JSON.parse(readFileSync(path).toString());
  }

  get fileName() {
    return `${this.name}.${this.version
      ?.replace(/\./g, "_")
      .replace("/", "-")}.component.xml`;
  }

  register(object: Thing<any>) {
    this.units.push(object);
    if ("classDescriptor" in object) {
      object.classDescriptor.add(this);
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
    //throw new Error("Method not implemented.");
    let name = UcpComponentDescriptor.getDescriptorName(packagePath, packageName, packageVersion);
    UcpComponentDescriptor._componentDescriptorStore[name] = this;
    return this;
  }
}

type UcpComponentDescriptorInitParameters = {
  path: string;
  relativePath: string;
};
