import OnceNodeServer from "../../../src/2_systems/Once/OnceNodeServer.class";

describe("ONCE", () => {

    test("start ONCE", async () => {

        await OnceNodeServer.start();
    });

    test("scenario Path", async () => {
        if (!ONCE) throw new Error("Missing ONCE");
        expect(ONCE.scenarioPath.match("/EAMD.ucp/Scenarios/")).toBeTruthy()
    });
});