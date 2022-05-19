import ServerSideEAMDLoader from "../../../src/2_systems/EAMD/ServerSideEAMDLoader.class";
import OnceNodeServer from "../../../src/2_systems/Once/OnceNodeServer.class";
import DefaultIOR from "../../../src/2_systems/Things/DefaultIOR.class";
import DefaultLoader from "../../../src/2_systems/Things/DefaultLoader.class"
beforeEach(async () => {
    if (ONCE_STARTED === false) await OnceNodeServer.start();
});

describe("Default Loader", () => {
    test("Find Loader", async () => {
        let loader = DefaultLoader.findLoader(new DefaultIOR().init("ior:esm:git:tla.EAM.Once"));
        expect(loader).toBeInstanceOf(ServerSideEAMDLoader);
    })
})