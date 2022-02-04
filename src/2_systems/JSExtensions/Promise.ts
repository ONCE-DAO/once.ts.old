

interface callback { (result: any): void };
interface timeoutCallback { (promiseHandler: promiseHandler): void };

type promiseHandler = {
    setSuccess: callback,
    setError: callback,
    _resolve?: callback,
    _reject?: callback,
    isCompleted: boolean
    timeoutId?: any,
    promise?: any
};
export default class extendedPromise<T> extends Promise<T> {
    constructor(executor: (resolve: any, reject: any) => extendedPromise<T>) {
        super((resolve, reject) => {
            return executor(resolve, reject);
        });
    }
    static isPromise(obj: any): boolean {
        return (typeof obj === 'undefined' ? 'undefined' : typeof (obj)) === 'object' && typeof obj.then === 'function';

    }

    static createPromiseHandler(timeoutMS?: number, timeoutCallback?: timeoutCallback): promiseHandler {

        const p: promiseHandler = {
            setSuccess: function (result) {
                clearTimeout(p.timeoutId);
                p.isCompleted = true;
                //@ts-ignore
                p._resolve(result);
            },
            isCompleted: false,

            setError: function (result) {
                clearTimeout(p.timeoutId);
                p.isCompleted = true;
                //@ts-ignore
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
