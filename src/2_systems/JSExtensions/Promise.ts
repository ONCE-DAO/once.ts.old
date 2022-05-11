

interface callback { (result: any): void };
interface timeoutCallback { (promiseHandler: promiseHandler): void };

export type promiseHandler = {
    setSuccess: callback,
    setError: callback,
    _resolve?: callback,
    _reject?: callback,
    isCompleted: boolean
    timeoutId?: any,
    promise: Promise<any>,
    metaData?: any
};
export default class ExtendedPromise<T> extends Promise<T> {
    constructor(executor: (resolve: any, reject: any) => ExtendedPromise<T>) {
        super((resolve, reject) => {
            return executor(resolve, reject);
        });
    }
    static isPromise(obj: any): boolean {
        return (typeof obj === 'undefined' ? 'undefined' : typeof (obj)) === 'object' && typeof obj.then === 'function';

    }

    static createPromiseHandler(timeoutMS?: number, timeoutCallback?: timeoutCallback): promiseHandler {

        const p: any = {
            setSuccess: function (result: any) {
                clearTimeout(p.timeoutId);
                p.isCompleted = true;
                p._resolve(result);
            },
            isCompleted: false,

            setError: function (result: any) {
                clearTimeout(p.timeoutId);
                p.isCompleted = true;
                p._reject(result);
            }
        };
        p.promise = new Promise(function (resolve, reject) {
            p._resolve = resolve;
            p._reject = reject;
        });


        if (timeoutMS) {
            const timeoutFunction = function () {

                if (timeoutCallback) {
                    timeoutCallback(p);
                } else {
                    p.setError(`Timeout after ${timeoutMS} milliseconds`)
                }
            }
            p.timeoutId = setTimeout(timeoutFunction, timeoutMS);
        }
        return p;
    }

    static wait(ms: number): Promise<void> {
        return new Promise(resolve => {
            setTimeout(() => { resolve(); }, ms);
        });
    }
}
