import Class from "../../3_services/Class.interface";
import UcpComponentDescriptor from "../UcpComponentDescriptor.class";

class ClassDescriptor {

    private static _classDescriptorStore = new WeakMap<Class<any>, ClassDescriptor>();
    ucpComponentDescriptor: UcpComponentDescriptor | undefined;
    filename: string | undefined;

    get componentExportName(): string {
        if (!this.name) throw new Error("No name");
        return this.name;
    }

    componentExport: 'defaultExport' | 'namedExport' | undefined;

    get packagePath(): string {
        if (!this.ucpComponentDescriptor?.srcPath) throw new Error("Missing srcPath in ucpComponentDescriptor");
        return this.ucpComponentDescriptor.srcPath;
    }
    get packageName(): string {
        if (!this.ucpComponentDescriptor?.name) throw new Error("Missing name in ucpComponentDescriptor");
        return this.ucpComponentDescriptor.name;

    }
    get packageVersion(): string {
        if (!this.ucpComponentDescriptor?.version) throw new Error("Missing version in ucpComponentDescriptor");
        return this.ucpComponentDescriptor.version;

    }

    get name(): string | undefined { return this._class?.name }

    static getClassDescriptor4Class(aClass: Class<any>): ClassDescriptor {
        let descriptor = this._classDescriptorStore.get(aClass);
        if (descriptor === undefined) {
            descriptor = new ClassDescriptor().init(aClass);
            this._classDescriptorStore.set(aClass, descriptor);
        }
        return descriptor;
    }

    /* get allInterfaces(): InterfaceDescriptor[] {
         let result: InterfaceDescriptor[] = [...this._interfaces];
         for (const interfaceObject of this._interfaces) {
             const extendedInterfaces = interfaceObject.allExtendedInterfaces;
             if (extendedInterfaces.length > 0) result.push(...extendedInterfaces);
         }
         return [...new Set(result)]
     }
     */

    implements(interfaceObject: InterfaceDescriptor) {
        return this.implementedInterfaces.includes(interfaceObject);
    }

    get packageFilename(): string {
        if (this.filename === undefined) throw new Error("Missing Filename")
        let filename = this.filename;
        if (filename.match('/src/')) {
            filename = filename.replace(/.*\/src\//, '');
        } else if (filename.match('/dist/')) {
            filename = filename.replace(/.*\/dist\//, '');
        }
        filename = filename.replace(/(\.js|\.ts)$/, '')
        return filename;
    }

    //TODO Change that to Component export path
    get classPackageString(): string {
        return `${this.packagePath}.${this.packageName}[${this.packageVersion}]/${this.className}`
    }

    private _class: Class<any> | undefined;
    private _interfaces: InterfaceDescriptor[] = [];
    private _extends: Class<any>[] = [];
    get extends(): Class<any>[] {
        if (!this._class) return [];
        if (this._extends.length == 0) {
            let myClass = this._class;

            // let myPrototype = myClass.prototype;
            // let myType = Object.getPrototypeOf(myClass);

            while (Object.getPrototypeOf(myClass)) {
                myClass = Object.getPrototypeOf(myClass);
                this._extends.push(myClass);
            }

            // //@ts-ignore
            // while (myClass.__proto__) {
            //     //@ts-ignore
            //     myClass = myClass.__proto__;
            //     this._extends.push(myClass);
            // }
        }
        return this._extends;
    };

    get class(): any { // TODO Missing Type
        return this._class
    }

    get className(): string {
        if (!this._class) throw new Error("Missing class in Descriptor")
        return this._class.name;
    }

    init(aClass: Class<any>): this {
        this._class = aClass;
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

    static register(packagePath: string, packageName: string, packageVersion: string | undefined): Function {
        return (aClass: any, name: string, x: any): void => {
            let classDescriptor = aClass.classDescriptor as ClassDescriptor | undefined;
            if (classDescriptor !== undefined) {
                classDescriptor.register(packagePath, packageName, packageVersion);
            }
        }
    }

    register(packagePath: string, packageName: string, packageVersion: string | undefined): void {
        let ucpComponentDescriptor = UcpComponentDescriptor.getDescriptor(packagePath, packageName, packageVersion);
        ucpComponentDescriptor.register(this.class);
        this.registerAllInterfaces();
    }

    private registerAllInterfaces(): void {
        const allInterfaces = this.implementedInterfaces;
        for (const aInterface of allInterfaces) {
            aInterface.addImplementation(this);
        }
    }

    get implementedInterfaces(): InterfaceDescriptorInterface[] {
        return this._getImplementedInterfaces();
    }

    _getImplementedInterfaces(interfaceList: InterfaceDescriptorInterface[] = []): InterfaceDescriptorInterface[] {

        // const add = (aInterfaceDescriptor: InterfaceDescriptorInterface) => {
        //     if (!interfaceList.includes(aInterfaceDescriptor)) {
        //         interfaceList = [...interfaceList, ...aInterfaceDescriptor._getImplementedInterfaces(interfaceList)]
        //     }
        // }

        for (const aInterfaceDescriptor of this._interfaces) {
            if (!interfaceList.includes(aInterfaceDescriptor)) {
                aInterfaceDescriptor._getImplementedInterfaces(interfaceList)
            }
        }


        //@ts-ignore
        if (this.extends[0] && this.extends[0]?.classDescriptor) {
            //@ts-ignore
            const classDescriptor = this.extends[0]?.classDescriptor as ClassDescriptor;

            classDescriptor._getImplementedInterfaces(interfaceList);
        }

        return interfaceList;
    }



    static addInterfaces(packagePath: string, packageName: string, packageVersion: string | undefined, interfaceName: string): Function {
        return (aClass: any, name: string, x: any): void => {
            let classDescriptor = aClass.classDescriptor as ClassDescriptor | undefined;
            if (classDescriptor !== undefined) {
                classDescriptor.addInterfaces(packagePath, packageName, packageVersion, interfaceName);
            }
        }
    }

    addInterfaces(packagePath: string, packageName: string, packageVersion: string | undefined, interfaceName: string): this {
        let interfaceDescriptor = InterfaceDescriptor.register(packagePath, packageName, packageVersion, interfaceName);
        this.add(interfaceDescriptor);
        return this;
    }

    static setFilePath(filename: string): Function {
        return (aClass: any, name: string, x: any): void => {
            let classDescriptor = aClass.classDescriptor as ClassDescriptor | undefined;
            if (classDescriptor !== undefined) {
                classDescriptor.setFilePath(filename);
            }
        }

    }

    setFilePath(filename: string) {
        this.filename = filename;
    }

    // Adds Object to export list
    static componentExport(exportType: 'defaultExport' | 'namedExport'): Function {
        return (aClass: any, name: string, x: any): void => {
            (aClass.classDescriptor as ClassDescriptor).componentExport = exportType;
        }
    }

}

type interfaceDescriptorInput = { packagePath: string, packageName: string, packageVersion: string | undefined, interfaceName: string }

export class InterfaceDescriptor {
    public readonly name: string;

    readonly extends: InterfaceDescriptor[] = [];
    readonly implementations: ClassDescriptor[] = [];
    public static lastDescriptor: InterfaceDescriptor;
    public ucpComponentDescriptor!: UcpComponentDescriptor;

    public filename: string = "Missing";

    _componentExport: 'namedExport' | 'defaultExport' | undefined;


    get componentExportName(): string {
        return this.name + 'ID';
    }

    get packagePath(): string {
        if (!this.ucpComponentDescriptor?.srcPath) throw new Error("Missing srcPath in ucpComponentDescriptor");
        return this.ucpComponentDescriptor.srcPath;
    }
    get packageName(): string {
        if (!this.ucpComponentDescriptor?.name) throw new Error("Missing name in ucpComponentDescriptor");
        return this.ucpComponentDescriptor.name;

    }
    get packageVersion(): string {
        if (!this.ucpComponentDescriptor?.version) throw new Error("Missing version in ucpComponentDescriptor");
        return this.ucpComponentDescriptor.version;

    }


    get allExtendedInterfaces(): InterfaceDescriptor[] {
        let result: InterfaceDescriptor[] = [];
        for (const interfaceObject of this.extends) {
            result.push(interfaceObject);
            const subInterfaces = interfaceObject.allExtendedInterfaces;
            if (subInterfaces.length > 0) result.push(...subInterfaces);
        }
        return result;
    }

    get implementedInterfaces(): InterfaceDescriptor[] {
        return this._getImplementedInterfaces();
    }

    get componentExport(): 'namedExport' | 'defaultExport' | undefined { return this._componentExport }
    set componentExport(value: 'namedExport' | 'defaultExport' | undefined) { this._componentExport = value; }

    _getImplementedInterfaces(interfaceList: InterfaceDescriptorInterface[] = []): InterfaceDescriptorInterface[] {
        if (!interfaceList.includes(this)) {
            interfaceList.push(this);
            for (const interfaceObject of this.extends) {
                interfaceObject._getImplementedInterfaces(interfaceList);
            }
        }
        return interfaceList;
    }

    addImplementation(classDescriptor: ClassDescriptor): this {
        this.implementations.push(classDescriptor);
        return this
    }


    addExtension(packagePath: string, packageName: string, packageVersion: string | undefined, interfaceName: string): InterfaceDescriptor {

        let ucpComponentDescriptor = UcpComponentDescriptor.getDescriptor(packagePath, packageName, packageVersion);

        let interfaceDesc = ucpComponentDescriptor.getUnitByName(interfaceName, 'InterfaceDescriptor')
        if (interfaceDesc === undefined) {
            interfaceDesc = new InterfaceDescriptor(ucpComponentDescriptor, interfaceName);;
        }

        this.add(interfaceDesc);

        return this;
    }

    add(object: InterfaceDescriptor | UcpComponentDescriptor): this {
        if (object instanceof InterfaceDescriptor) {
            this.extends.push(object)
        } else if ("writeToPath" in object) {
            this.ucpComponentDescriptor = object;
        }
        return this;
    }

    static register(packagePath: string, packageName: string, packageVersion: string | undefined, interfaceName: string): InterfaceDescriptor {
        let ucpComponentDescriptor = UcpComponentDescriptor.getDescriptor(packagePath, packageName, packageVersion);

        let interfaceDesc = ucpComponentDescriptor.getUnitByName(interfaceName, 'InterfaceDescriptor')
        if (interfaceDesc) {
            return interfaceDesc;
        }

        interfaceDesc = new InterfaceDescriptor(ucpComponentDescriptor, interfaceName);
        InterfaceDescriptor.lastDescriptor = interfaceDesc;

        return interfaceDesc;
    }

    constructor(ucpComponentDescriptor: UcpComponentDescriptor, interfaceName: string) {
        this.name = interfaceName;
        ucpComponentDescriptor.register(this);
        return this;
    }

}


export type InterfaceDescriptorInterface = InstanceType<typeof InterfaceDescriptor>

export default ClassDescriptor