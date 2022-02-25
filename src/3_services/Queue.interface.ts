type asyncFunction = (...args: any[]) => Promise<any>;

export default interface FunctionPromiseQueue {
    enqueue<R>(fun: asyncFunction, timeout: number): Promise<R>
}