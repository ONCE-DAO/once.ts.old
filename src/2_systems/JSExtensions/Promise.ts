

export default class extendedPromise<T> extends Promise<T> {
    constructor(executor: (resolve: any, reject: any) => extendedPromise<T>) {
        super((resolve, reject) => {
            return executor(resolve, reject);
        });
    }
    static isPromise(anObject: any): boolean {
        return (anObject !== Object(anObject)) ||
            (typeof (anObject) === "string" || anObject instanceof String) ||
            (typeof (anObject) === "number" || anObject instanceof Number) ||
            (typeof (anObject) === "boolean" || anObject instanceof Boolean);
    }
}
