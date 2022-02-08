import { readFileSync, writeFileSync } from "fs";
import { basename, join } from "path";
import { NpmPackage } from "./NpmPackage.class";
import { create } from "xmlbuilder2";

export default class UcpComponentDescriptor {
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
}

type UcpComponentDescriptorInitParameters = {
  path: string;
  relativePath: string;
};
