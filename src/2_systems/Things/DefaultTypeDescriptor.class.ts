import TypeDescriptor, { TSClass } from "../../3_services/TypeDescriptor.interface";
import { Thing } from "../../exports";

export default class DefaultTypeDescriptor implements TypeDescriptor {

    private _class: any;
    private _extends: TSClass = null;
    get extends(): TSClass {
        if (!this._extends) { }
        return this._extends;
    };

    get class(): any {
        return this._class
    }

    init(aClass: any): this {
        this._class = aClass;
        return this;
    }

}