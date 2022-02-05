import EAMDLoader from "../../../src/2_systems/EAMD/EAMDLoader.class";
import DefaultIOR from "../../../src/2_systems/Things/DefaultIOR.class";
import DefaultLoader from "../../../src/2_systems/Things/DefaultLoader.class"

describe("Default Loader", () => {
    test("Find Loader", async () => {
        let loader = DefaultLoader.findLoader(new DefaultIOR().init("ior:esm:git:tla.EAM.Once"));
        expect(loader).toBeInstanceOf(EAMDLoader);
    })
})