import EAMDLoader from "../../../src/2_systems/EAMD/EAMDLoader.class";
import DefaultIOR from "../../../src/2_systems/Things/DefaultIOR.class";
import Thing from "../../../src/3_services/Thing.interface";

describe("EAMD Loader", () => {

  test(`IOR Find Loader`, () => {
    // @ts-ignore
    let ior = new DefaultIOR().init("ior:esm:git:tla.EAM.Once");
    let loader = ior.loader;
    expect(loader).toBeInstanceOf(EAMDLoader);
  });

  test(`IOR load Thing from Namespace`, async () => {

    let loadedDefaultIOR = (await (DefaultIOR.load("ior:esm:git:tla.EAM.Once"))).DefaultIOR;
    expect(loadedDefaultIOR).toEqual(DefaultIOR);
  })

  // test(`import load Thing from Namespace`, async () => {

  //   // @ts-ignore
  //   let loadedDefaultIOR = (await import("ior:esm:git:tla.EAM.Once")).DefaultIOR;
  //   expect(loadedDefaultIOR).toEqual(DefaultIOR);
  // })
});
