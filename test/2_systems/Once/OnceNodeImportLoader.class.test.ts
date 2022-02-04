import {
    load,
    resolve,
    globalPreload,
} from "../../../src/2_systems/Once/OnceNodeImportLoader.class";
import DefaultIOR from "../../../src/2_systems/Things/DefaultIOR.class";


test("load", async () => {

    let loadedDefaultIOR = (await (load("ior:esm:git:tla.EAM.Once"))).DefaultIOR;
    expect(loadedDefaultIOR).toEqual(DefaultIOR);

})
