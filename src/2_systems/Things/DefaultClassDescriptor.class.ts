import Class from "../../3_services/Class.interface";
import ClassDescriptor, { InterfaceDescriptor } from "../../3_services/ClassDescriptor.interface";

export default class DefaultClassDescriptor implements ClassDescriptor {

    private static _classDescriptorStore = new WeakMap<Class<any>, DefaultClassDescriptor>();

    static getClassDescriptor4Class(aClass: Class<any>): ClassDescriptor {
        let descriptor = this._classDescriptorStore.get(aClass);
        if (descriptor === undefined) {
            descriptor = new DefaultClassDescriptor().init(aClass);
            this._classDescriptorStore.set(aClass, descriptor);
        }
        return descriptor;
    }

    get implements() {
        let result: InterfaceDescriptor[] = [...this._interfaces];
        for (const interfaceObject of this._interfaces) {
            const extendedInterfaces = interfaceObject.allExtendedInterfaces;
            if (extendedInterfaces.length > 0) result.push(...extendedInterfaces);
        }
        return result
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

    addInterfaces(interfaceList: string[]): this {
        for (let interfaceName of interfaceList) {
            let interfaceDescriptorInstance = DefaultInterfaceDescriptor.getInterfaceByName(interfaceName)
            if (interfaceDescriptorInstance === undefined) {
                interfaceDescriptorInstance = new DefaultInterfaceDescriptor(interfaceName);
            }
            this.add(interfaceDescriptorInstance);
        }
        return this;
    }

    add(object: any): this {
        if (object instanceof DefaultInterfaceDescriptor) {
            this._interfaces.push(object)
            object.addImplementation(this);
        }
        return this;
    }

    static addInterfaces(interfaceList: any[]): Function {
        return (aClass: any, name: string, x: any): void => {

            aClass.classDescriptor.addInterfaces(interfaceList);
        }
    }
}

export class DefaultInterfaceDescriptor implements InterfaceDescriptor {
    private static _interfaceStore: { [i: string]: InterfaceDescriptor } = {};
    readonly extends: InterfaceDescriptor[] = [];

    static getOrCreateInterfaceByName(name: string): InterfaceDescriptor {
        const existingInterface = this.getInterfaceByName(name);
        if (existingInterface) return existingInterface;
        return new this(name);
    }

    static getInterfaceByName(name: string): InterfaceDescriptor | undefined {
        if (this._interfaceStore[name]) {
            return this._interfaceStore[name];
        }
        return undefined;
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

    readonly name: string;
    readonly implementations: ClassDescriptor[] = [];

    constructor(name: string) {
        this.name = name;
        if (DefaultInterfaceDescriptor._interfaceStore[name]) throw new Error("Interface with the name already exists '" + name + "'");
        DefaultInterfaceDescriptor._interfaceStore[name] = this;
    }

    addImplementation(classDescriptor: ClassDescriptor): this {
        this.implementations.push(classDescriptor);
        return this
    }

    addExtension(listOfInterfaces: string[]): InterfaceDescriptor {
        for (let interfaceName of listOfInterfaces) {
            let interfaceDescriptorInstance = DefaultInterfaceDescriptor.getInterfaceByName(interfaceName)
            if (interfaceDescriptorInstance === undefined) {
                interfaceDescriptorInstance = new DefaultInterfaceDescriptor(interfaceName);
            }
            this.add(interfaceDescriptorInstance);
        }
        return this;
    }

    add(object: any): this {
        if (object instanceof DefaultInterfaceDescriptor) {
            this.extends.push(object)
        }
        return this;
    }

}