import BaseThing from "../../1_infrastructure/BaseThing.class";
import FunctionPromiseQueue from "../../3_services/Queue.interface";
import ExtendedPromise, { promiseHandler } from "../JSExtensions/Promise";
import UUiD from "../JSExtensions/UUiD.class";


type FunctionPromiseQueueConfig = { timeout?: number, priority?: number }
export default class DefaultFunctionPromiseQueue extends BaseThing<FunctionPromiseQueue> implements FunctionPromiseQueue {

    protected _queue: promiseHandler[][] = [[]];
    public silentMode: boolean = false;
    private workingOnPromise: boolean = false;
    public debug: boolean = false;
    private _runningHandler: promiseHandler | undefined;
    init(name: string): this {
        this._name = name;

        const dequeue = this.dequeue;
        let wrapperFunction = new Function(
            "return function dequeue_" + this.name.replaceAll(/[^a-zA-Z\d]/g, '_') + "(dequeue){ return dequeue.call(this)}"
        )
        this.dequeue = wrapperFunction().bind(this, dequeue);

        return this;
    }

    async enqueue<R>(fun: () => R, config?: FunctionPromiseQueueConfig): Promise<Awaited<R>> {
        const priority = config?.priority || 0;
        const timeout = config?.timeout || 0;

        const queue = this;

        // Error needs be done now to have the correct Stack
        const timeoutError = new Error(`Got Timeout in FunctionPromiseQueue: '${this.name}' Function: '${fun.name}'`);
        const timeoutFunction = function (promiseHandler: promiseHandler) {

            if (promiseHandler.metaData.status === 'executed') {
                timeoutError.message += ` | Function is running`
            } else {
                timeoutError.message += ` QueueSize: [${queue._queue.length}]`
            }
            promiseHandler.setError(timeoutError);
            if (!queue.silentMode) {
                console.error(timeoutError);
                console.error(timeoutError.stack);
            }

            // Let the queue start over again
            if (promiseHandler.metaData.status === 'executed') {
                promiseHandler.metaData.status = 'timeout';
                queue.workingOnPromise = false;
                queue.dequeue();
            } else {
                promiseHandler.metaData.status = 'timeout';
            }

        }

        const promiseHandler = ExtendedPromise.createPromiseHandler(timeout, timeoutFunction.bind(this));
        if (this.debug === true) {
            promiseHandler.metaData.id = UUiD.uuidv4();
            console.warn(`Enqueue into ${this.name} Function: ${fun.name} ID: ${promiseHandler.metaData.id}`);
        }
        promiseHandler.metaData = { function: fun };
        if (this._queue[priority] === undefined) this._queue[priority] = [];
        this._queue[priority].push(promiseHandler);
        this.dequeue();
        return promiseHandler.promise;
    }

    async awaitAll(): Promise<any[]> {
        let result: any[] = [];
        let all = this.getAllQueuedObjects();
        while (all.length > 0 || this._runningHandler) {
            if (this._runningHandler) {
                result = [...result, await this._runningHandler.promise];
            }
            result = [...result, await Promise.all(all.map(ph => ph.promise))]
            all = this.getAllQueuedObjects();
        }
        return result;
    }

    private getNextQueueObject(): promiseHandler | undefined {
        for (let queue of this._queue) {
            let object = queue.shift();
            if (object) return object;
        }
        return undefined;
    }

    private getAllQueuedObjects(): promiseHandler[] {
        return this._queue.flat(1);
    }

    async dequeue() {
        if (this.workingOnPromise === true) return false;
        const item = this.getNextQueueObject();
        if (item === undefined) {
            this._runningHandler = undefined;
            return false;
        }
        this._runningHandler = item;
        if (this.debug === true) {
            console.warn(`Dequeue from ${this.name} Function: ${item.metaData.function.name} ID: ${item.metaData.id}`);
        }

        const processInQueue = (result: any) => {
            item.setSuccess(result);
            this.workingOnPromise = false;
            this.dequeue();
        }
        const catchQueueError = (err: any) => {
            item.setError(err);
            this.workingOnPromise = false;
            this.dequeue();
        }

        try {
            this.workingOnPromise = true;
            item.metaData.status = 'executed';
            item.metaData.function()
                .then(processInQueue)
                .catch(catchQueueError)
        } catch (err) {
            catchQueueError(err);
        }

        return true;
    }
}
