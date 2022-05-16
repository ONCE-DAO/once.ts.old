import DefaultOnceConfig from "../../../src/2_systems/Once/ONCEConfig.class";
import OnceNodeServer from "../../../src/2_systems/Once/OnceNodeServer.class";

beforeEach(async () => {
    if (ONCE_STARTED === false) await OnceNodeServer.start();
});

describe("ONCE", () => {

    test("start ONCE", async () => {

        expect(ONCE).not.toBe(undefined);
    });

    test("scenario Path", async () => {
        //@ts-ignore
        expect(ONCE.scenarioPath.match("/EAMD.ucp/Scenarios/")).toBeTruthy()
    });

    test("Once Config", async () => {
        if (!ONCE) throw new Error("Missing ONCE");
        let config = await ONCE.getConfig();
        expect(config).toBeInstanceOf(DefaultOnceConfig);
    });
});