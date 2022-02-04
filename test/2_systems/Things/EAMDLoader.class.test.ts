import EAMDLoader from "../../../src/2_systems/EAMD/EAMDLoader.class";
import DefaultIOR from "../../../src/2_systems/Things/DefaultIOR.class";

describe("EAMD Loader", () => {

  test(`IOR Find Loader`, () => {
    // @ts-ignore
    let ior = new DefaultIOR().init("ior:esm:git:tla.EAM.Once");
    let loader = ior.loader;
    expect(loader).toBeInstanceOf(EAMDLoader);
  });



});
