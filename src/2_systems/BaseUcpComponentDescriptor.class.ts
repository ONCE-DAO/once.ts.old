import { UcpComponentDescriptorInterface } from "../3_services/UcpComponentDescriptor.interface";

let ActiveUcpComponentDescriptor: any;

if (typeof window === "undefined") {
  let moduleItem = await import("./ServerSideUcpComponentDescriptor.class")
  ActiveUcpComponentDescriptor = moduleItem.default;
} else {
  ActiveUcpComponentDescriptor = (await import("./DefaultUcpComponentDescriptor.class")).default;

}

export default class UcpComponentDescriptor {


  static register(packagePath: string, packageName: string, packageVersion: string | undefined): Function {
    return ActiveUcpComponentDescriptor.register(packagePath, packageName, packageVersion);
  }

  static getDescriptor(packagePath: string, packageName: string, packageVersion: string | undefined): UcpComponentDescriptorInterface {
    return ActiveUcpComponentDescriptor.getDescriptor(packagePath, packageName, packageVersion);
  }

}