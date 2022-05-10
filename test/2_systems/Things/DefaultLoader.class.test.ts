import EAMDLoader from "../../../src/2_systems/EAMD/EAMDLoader.class";
import OnceNodeServer from "../../../src/2_systems/Once/OnceNodeServer.class";
import DefaultIOR from "../../../src/2_systems/Things/DefaultIOR.class";
import DefaultLoader from "../../../src/2_systems/Things/DefaultLoader.class"
beforeEach(async () => {
    if (typeof ONCE === "undefined") await OnceNodeServer.start();
});
describe("Default Loader", () => {
    test("Find Loader", async () => {
        EAMDLoader;
        let loader = DefaultLoader.findLoader(new DefaultIOR().init("ior:esm:git:tla.EAM.Once"));
        expect(loader).toBeInstanceOf(EAMDLoader);
    })
})