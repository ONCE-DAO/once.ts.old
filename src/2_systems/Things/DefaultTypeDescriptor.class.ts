import TypeDescriptor, { TSClass } from "../../3_services/TypeDescriptor.interface";
import { Thing } from "../../exports";



export default class DefaultTypeDescriptor implements TypeDescriptor {
    class: TSClass;
    protected _type: Constructor;
    classDescription: ClassDescription;
    properties: PropertyBehavior[];
    relationships: RelationshipBehavior[];
    collections: CollectionBehavior[];
    methods: Method[];
    getSourceCode(): string {
        throw new Error("Method not implemented.");
    }
    apply(this: Function, thisArg: any, argArray?: any) {
        throw new Error("Method not implemented.");
    }
    call(this: Function, thisArg: any, ...argArray: any[]) {
        throw new Error("Method not implemented.");
    }
    bind(this: Function, thisArg: any, ...argArray: any[]) {
        throw new Error("Method not implemented.");
    }
    toString(): string {
        throw new Error("Method not implemented.");
    }
    prototype: any;
    length: number;
    arguments: any;
    caller: Function;
    name: string;
    [Symbol.hasInstance](value: any): boolean {
        throw new Error("Method not implemented.");
    }

    private _class: TSClass = new TSClass(this.constructor);

    get extends(): TSClass | undefined {
        if (!this._class) { return undefined }
        return this._class.extends;
    };

    get type(): TSClass {
        return this._class
    }

    init(aClass: TSClass): this {
        this._class = aClass;
        return this;
    }

}