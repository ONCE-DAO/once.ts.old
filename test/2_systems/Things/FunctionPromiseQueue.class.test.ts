import ExtendedPromise from "../../../src/2_systems/JSExtensions/Promise";
import DefaultFunctionPromiseQueue from "../../../src/2_systems/Things/DefaultFunctionPromiseQueue.class";


describe("Function Promise Queue", () => {
    test("init", async () => {
        let queue = new DefaultFunctionPromiseQueue().init("My Queue");
        expect(queue).toBeInstanceOf(DefaultFunctionPromiseQueue);
    })
    let queueObject = new DefaultFunctionPromiseQueue().init("test");
    beforeEach(() => {
        queueObject = new DefaultFunctionPromiseQueue().init("test");
        queueObject.silentMode = true;
    })

    test("enqueue check result", async () => {
        const testFunction = async (): Promise<string> => {
            return "OK";
        }
        let promise = queueObject.enqueue(testFunction);
        expect(ExtendedPromise.isPromise(promise));
        let result = await promise;
        expect(result).toBe("OK");
    })

    // test("enqueue sync function", async () => {
    //     const testFunction = (): string => {
    //         return "OK";
    //     }
    //     let promise = queueObject.enqueue(testFunction);

    //     expect(ExtendedPromise.isPromise(promise));
    //     let result = await promise;
    //     expect(result).toBe("OK");
    // })

    test("enqueue check 100 Queued Functions", async () => {
        let result: number[] = [];
        const testFunction = async (id: number) => {
            await ExtendedPromise.wait(1);
            result.push(id);
            return id;
        }
        let lastPromise
        for (let i = 0; i < 100; i++) {
            lastPromise = queueObject.enqueue(testFunction.bind(this, i));
        }

        expect(result.length).toBe(0);

        await lastPromise;

        for (let i = 0; i < 100; i++) {
            expect(result[i]).toBe(i);

        }
    })

    test("enqueue timeout", async () => {
        const testFunction = async (): Promise<string> => {
            await ExtendedPromise.wait(20);
            return "OK";
        }
        try {
            let promise = await queueObject.enqueue(testFunction, { timeout: 5 })

            expect(ExtendedPromise.isPromise(promise));
            await promise;
            throw new Error("Missing Error")
        } catch (err: any) {
            expect(err.message).toBe("Got Timeout in FunctionPromiseQueue: 'test' Function: 'testFunction' | Function is running");
        }
    })

    test("enqueue async Function throws an error", async () => {
        const testFunction = async (): Promise<string> => {
            throw new Error("It went wrong")
        }
        try {
            let promise = await queueObject.enqueue(testFunction)

            expect(ExtendedPromise.isPromise(promise));
            await promise;
            throw new Error("Missing Error")
        } catch (err: any) {
            expect(err.message).toBe("It went wrong");
        }
    })


    test("enqueue check 100 with Priority", async () => {
        let result: number[] = [];
        const testFunction = async (id: number) => {
            await ExtendedPromise.wait(1);
            result.push(id);
            return id;
        }
        let latestPromise

        for (let i = 0; i < 100; i++) {
            latestPromise = queueObject.enqueue(testFunction.bind(this, i), { priority: i });
        }

        expect(result.length).toBe(0);

        await latestPromise;

        for (let i = 0; i < 100; i++) {
            expect(result[i]).toBe(i);

        }
    })


    test("enqueue check 100 with Priority reverse", async () => {
        let result: number[] = [];
        const testFunction1 = async (id: number) => {
            await ExtendedPromise.wait(10);
            return id;
        }
        const testFunction = async (id: number) => {
            await ExtendedPromise.wait(1);
            result.push(id);
            return id;
        }
        queueObject.enqueue(testFunction1.bind(this, 0), { priority: 0 });

        let firstPromise;
        for (let i = 0; i < 100; i++) {
            const p = queueObject.enqueue(testFunction.bind(this, i), { priority: 99 - i });
            firstPromise = firstPromise || p;
        }

        expect(result.length).toBe(0);

        await firstPromise;

        for (let i = 0; i < 100; i++) {
            expect(result[i]).toBe(99 - i);

        }
    })

    test(".awaitAll", async () => {
        let result: number[] = [];
        const testFunction1 = async (id: number) => {
            await ExtendedPromise.wait(10);
            result.push(id);
            return id;
        }

        queueObject.enqueue(testFunction1.bind(this, 0), { priority: 0 });
        queueObject.enqueue(testFunction1.bind(this, 5), { priority: 1 });

        expect(result.length).toBe(0);
        await queueObject.awaitAll();
        expect(result.length).toBe(2);

        expect(result[0]).toBe(0)
    })
})