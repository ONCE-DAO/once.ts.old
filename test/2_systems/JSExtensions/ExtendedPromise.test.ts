import ExtendedPromise from "../../../src/2_systems/JSExtensions/Promise"


describe("Extended Promise", () => {
    test("isPromise (false)", async () => {
        expect(ExtendedPromise.isPromise('test')).toBe(false);
    })

    test("isPromise (true)", async () => {
        let promiseHandler = ExtendedPromise.createPromiseHandler();
        expect(ExtendedPromise.isPromise(promiseHandler.promise)).toBe(true);
    })
    test("createPromiseHandler (success)", async () => {
        let promiseHandler = ExtendedPromise.createPromiseHandler();

        expect(promiseHandler.isCompleted).toBe(false);

        promiseHandler.setSuccess('ok');
        expect(promiseHandler.isCompleted).toBe(true);

        let result = await promiseHandler.promise;
        expect(result).toBe('ok');



    });

    test("createPromiseHandler (error)", async () => {
        let promiseHandler = ExtendedPromise.createPromiseHandler();

        expect(promiseHandler.isCompleted).toBe(false);

        let result;
        promiseHandler.promise.catch((error: any) => { result = error; })

        promiseHandler.setError('error');
        expect(promiseHandler.isCompleted).toBe(true);
        await ExtendedPromise.wait(1);

        expect(result).toBe("error");

    });


    test("createPromiseHandler (timeout)", async () => {
        let result;

        let promiseHandler = ExtendedPromise.createPromiseHandler(10, (h) => { result = 'timeout' });

        expect(promiseHandler.isCompleted).toBe(false);

        await ExtendedPromise.wait(30);
        expect(promiseHandler.isCompleted).toBe(false);


        expect(result).toBe("timeout");

    });

})