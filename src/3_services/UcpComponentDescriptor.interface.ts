import { NpmPackage } from "../2_systems/NpmPackage.class";
import { InterfaceDescriptor, InterfaceDescriptorInterface } from "../2_systems/Things/DefaultClassDescriptor.class";
import { ThingStatics } from "./Thing.interface";

export interface UcpComponentDescriptorInterface {

    // TODO: specify better
    units: (ThingStatics<any> | InterfaceDescriptorInterface)[];

    npmPackage: NpmPackage;

    relativeSrcPath: string | undefined;

    identifier: string | undefined;



    get name(): string

    get version(): string

    get srcPath(): string

    defaultExportObject: ThingStatics<any> | InterfaceDescriptor | undefined

    getUnitByName(name: string, type: 'InterfaceDescriptor' | 'ClassDescriptor'): any


    register(object: ThingStatics<any> | InterfaceDescriptorInterface): void

    //  static register(packagePath: string, packageName: string, packageVersion: string | undefined): Function 

    // static getDescriptor(packagePath: string, packageName: string, packageVersion: string | undefined): UcpComponentDescriptorInterface 

    initBasics(packagePath: string, packageName: string, packageVersion: string | undefined): UcpComponentDescriptorInterface
}