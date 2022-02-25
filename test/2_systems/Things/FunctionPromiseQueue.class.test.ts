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
            await ExtendedPromise.wait(2);
            result.push(id);
            return id;
        }
        for (let i = 0; i < 100; i++) {
            queueObject.enqueue(testFunction.bind(this, i));
        }

        expect(result.length).toBe(0);

        await ExtendedPromise.wait(300);

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
            let promise = await queueObject.enqueue(testFunction, 5)

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
})