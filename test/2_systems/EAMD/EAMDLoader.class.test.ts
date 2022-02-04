import EAMDLoader from "../../../src/2_systems/EAMD/EAMDLoader.class";
import DefaultIOR from "../../../src/2_systems/Things/DefaultIOR.class";

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

  test(`CanHandler`, async () => {

    let ior = new DefaultIOR().init("ior:esm:git:tla.EAM.Once");

    expect(EAMDLoader.canHandle(ior)).toBe(1);
    expect(ior.loader.canHandle(ior)).toBe(1);

    let ior2 = new DefaultIOR().init("ior:google.de");

    expect(EAMDLoader.canHandle(ior2)).toBe(0);


  })

  // test(`import load Thing from Namespace`, async () => {

  //   // @ts-ignore
  //   let loadedDefaultIOR = (await import("ior:esm:git:tla.EAM.Once")).DefaultIOR;
  //   expect(loadedDefaultIOR).toEqual(DefaultIOR);
  // })
});
