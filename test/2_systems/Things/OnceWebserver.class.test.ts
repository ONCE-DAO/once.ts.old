import OnceNodeServer from "../../../src/2_systems/Once/OnceNodeServer.class";

import fetch from 'node-fetch';

import OnceWebserver from "../../../src/2_systems/Once/Fastify.class";

let server: OnceWebserver;

beforeEach(async () => {
    if (ONCE_STARTED === false) await OnceNodeServer.start();
});

afterEach(async () => {
    await server.stop();
})

describe("Once WebServer", () => {


    test("init", async () => {
        server = new OnceWebserver();
        expect(server).toBeInstanceOf(OnceWebserver);

        expect(server.status).toBe("stopped");
    })



    test("start", async () => {
        server = new OnceWebserver();

        await server.start();
        expect(server.status).toBe("running");


        let result = await fetch(server.internalUrl.href);

        expect(result.ok).toBe(true);

        await server.stop();
        expect(server.status).toBe("stopped");


    })

    test("test ONCE Directory", async () => {
        server = new OnceWebserver();

        await server.start();
        expect(server.status).toBe("running");


        let url = server.internalUrl;
        url.pathName = "/EAMD.ucp/tla/EAM/once.ts/README.md";

        let result = await fetch(url.href);

        expect(result.ok).toBe(true);

        await server.stop();
        expect(server.status).toBe("stopped");


    })



})
