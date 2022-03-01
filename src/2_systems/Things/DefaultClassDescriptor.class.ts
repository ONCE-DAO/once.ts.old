import Class from "../../3_services/Class.interface";
import ClassDescriptor from "../../3_services/ClassDescriptor.interface";

export default class DefaultClassDescriptor implements ClassDescriptor {
    get implements() { return this._interfaces }

    private _class: Class<any> | undefined;
    private _interfaces: any[] = [];
    private _extends: Class<any>[] = [];
    get extends(): Class<any>[] {
        if (!this._class) return [];
        if (this._extends.length == 0) {
            let myClass = this._class;

            let myPrototype = myClass.prototype;
            let myType = Object.getPrototypeOf(myClass);
            
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

    get class(): any {
        return this._class
    }

    init(aClass: Class<any>): this {
        this._class = aClass;
        return this;
    }

    addInterfaces(interfaceList: any[]): void {
        this._interfaces = interfaceList;
    }

    static addInterfaces(interfaceList: any[]): Function {
        return (aClass: any, name: string, x: any): void => {
            aClass.classDescriptor.addInterfaces(interfaceList);
        }
    }

    addSomething(...args: any[]): any {
        console.log(...args);
    }

}