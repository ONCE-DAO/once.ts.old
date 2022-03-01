type asyncFunction = (...args: any[]) => Promise<any>;


export type FunctionPromiseQueueConfig = { timeout?: number, priority?: number }

export default interface FunctionPromiseQueue {
    enqueue<R>(fun: asyncFunction, config?: FunctionPromiseQueueConfig): Promise<R>
    init(name: string): this
    awaitAll(): Promise<any[]>
}