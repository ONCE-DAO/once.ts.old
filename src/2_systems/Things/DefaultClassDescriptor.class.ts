import Class from "../../3_services/Class.interface";
import UcpComponentDescriptor from "../UcpComponentDescriptor.class";

export default class ClassDescriptor {


    private static _classDescriptorStore = new WeakMap<Class<any>, ClassDescriptor>();
    ucpComponentDescriptor: UcpComponentDescriptor | undefined;
    filename: string | undefined;

    static getClassDescriptor4Class(aClass: Class<any>): ClassDescriptor {
        let descriptor = this._classDescriptorStore.get(aClass);
        if (descriptor === undefined) {
            descriptor = new ClassDescriptor().init(aClass);
            this._classDescriptorStore.set(aClass, descriptor);
        }
        return descriptor;
    }

    get allInterfaces() {
        let result: InterfaceDescriptor[] = [...this._interfaces];
        for (const interfaceObject of this._interfaces) {
            const extendedInterfaces = interfaceObject.allExtendedInterfaces;
            if (extendedInterfaces.length > 0) result.push(...extendedInterfaces);
        }
        return result
    }

    implements(interfaceObject: InterfaceDescriptor) {
        return this.allInterfaces.includes(interfaceObject);
    }

    private _class: Class<any> | undefined;
    private _interfaces: InterfaceDescriptor[] = [];
    private _extends: Class<any>[] = [];
    get extends(): Class<any>[] {
        if (!this._class) return [];
        if (this._extends.length == 0) {
            let myClass = this._class;
            //@ts-ignore
            while (myClass.__proto__) {
                //@ts-ignore
                myClass = myClass.__proto__;
                this._extends.push(myClass);
            }
        }
        return this._extends;
    };

    get class(): any {
        return this._class
    }

    init(aClass: Class<any>): this {
        this._class = aClass;
        return this;
    }

    addInterfaces(packagePath: string, packageName: string, packageVersion: string | undefined, interfaceName: string): this {
        let interfaceDescriptor = InterfaceDescriptor.register(packagePath, packageName, packageVersion, interfaceName);
        this.add(interfaceDescriptor);
        return this;
    }

    add(object: InterfaceDescriptor | UcpComponentDescriptor): ClassDescriptor {
        if (object instanceof InterfaceDescriptor) {
            this._interfaces.push(object);
            object.addImplementation(this);
        } else if (object instanceof UcpComponentDescriptor) {
            this.ucpComponentDescriptor = object;
        }

        return this;
    }

    static addInterfaces(packagePath: string, packageName: string, packageVersion: string | undefined, interfaceName: string): Function {
        return (aClass: any, name: string, x: any): void => {

            (aClass.classDescriptor as ClassDescriptor).addInterfaces(packagePath, packageName, packageVersion, interfaceName);
        }
    }

    static setFilePath(filename: string): Function {
        return (aClass: any, name: string, x: any): void => {
            (aClass.classDescriptor as ClassDescriptor).setFilePath(filename);
        }

    }

    setFilePath(filename: string) {
        this.filename = filename;
    }

    // Adds Object to export list
    static componentExport(config?: { silent?: boolean }): Function {
        return (aClass: any, name: string, x: any): void => {

            try {
                (aClass.classDescriptor as ClassDescriptor).componentExport = true;
            } catch (e) {
                if (config?.silent !== true) {
                    throw e;
                } else {
                    console.error(e);
                }
            }
        }
    }

    set componentExport(newValue: boolean) {

        if (!this.ucpComponentDescriptor) {
            throw new Error("Missing ucpComponentDescriptor in classDescriptor (Missing UcpComponentDescriptor.register)" + this.class.name)
        }

        const exportList = this.ucpComponentDescriptor.exportList;
        if (newValue === true) {
            exportList.push(this)
        } else {
            exportList.splice(exportList.indexOf(this), 1)
        }
    }

    get componentExport(): boolean {
        if (!this.ucpComponentDescriptor) throw new Error("Missing ucpComponentDescriptor in classDescriptor " + this.class.name)
        return this.ucpComponentDescriptor.exportList.includes(this);
    }
}

export class InterfaceDescriptor {
    private static readonly _interfaceStore: { [i: string]: InterfaceDescriptor } = {};
    readonly extends: InterfaceDescriptor[] = [];
    readonly implementations: ClassDescriptor[] = [];

    get allExtendedInterfaces(): InterfaceDescriptor[] {
        let result: InterfaceDescriptor[] = [];
        for (const interfaceObject of this.extends) {
            result.push(interfaceObject);
            const subInterfaces = interfaceObject.allExtendedInterfaces;
            if (subInterfaces.length > 0) result.push(...subInterfaces);
        }
        return result;
    }

    addImplementation(classDescriptor: ClassDescriptor): this {
        this.implementations.push(classDescriptor);
        return this
    }


    // addExtension(listOfInterfaces: string[]): InterfaceDescriptor {
    //     for (let interfaceName of listOfInterfaces) {
    //         let interfaceDescriptorInstance = InterfaceDescriptor.getInterfaceByName(interfaceName)
    //         if (interfaceDescriptorInstance === undefined) {
    //             interfaceDescriptorInstance = new InterfaceDescriptor(interfaceName);
    //         }
    //         this.add(interfaceDescriptorInstance);
    //     }
    //     return this;
    // }

    add(object: any): this {
        if (object instanceof InterfaceDescriptor) {
            this.extends.push(object)
        }
        return this;
    }


    static getInterfaceByName(uniqueName: string): InterfaceDescriptor | undefined {
        if (this._interfaceStore[uniqueName]) {
            return this._interfaceStore[uniqueName];
        }
        return undefined;
    }

    static register(packagePath: string, packageName: string, packageVersion: string | undefined, interfaceName: string): InterfaceDescriptor {
        const uniqueName = this.uniqueName(packagePath, packageName, packageVersion, interfaceName);
        if (InterfaceDescriptor._interfaceStore[uniqueName]) {
            return InterfaceDescriptor._interfaceStore[uniqueName];
        }
        return new InterfaceDescriptor(packagePath, packageName, packageVersion, interfaceName);
    }


    static uniqueName(packagePath: string, packageName: string, packageVersion: string | undefined, interfaceName: string): string {
        return `${packagePath}${packageName}[${packageVersion || 'latest'}]/${interfaceName}`
    }

    get uniqueName(): string {
        return InterfaceDescriptor.uniqueName(this.packagePath, this.packageName, this.packageVersion, this.interfaceName);
    }

    constructor(public packagePath: string, public packageName: string, public packageVersion: string | undefined, public interfaceName: string) {
        const uniqueName = this.uniqueName
        if (InterfaceDescriptor._interfaceStore[uniqueName]) throw new Error("Interface with the name already exists '" + uniqueName + "'");
        InterfaceDescriptor._interfaceStore[uniqueName] = this;
    }

}