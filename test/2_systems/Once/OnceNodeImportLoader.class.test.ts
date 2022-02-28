import {
    load,
    resolve,
    globalPreload,
} from "../../../src/2_systems/Once/OnceNodeImportLoader.class";
import DefaultIOR from "../../../src/2_systems/Things/DefaultIOR.class";


test("resolve", async () => {

    const defaultResolve = (x: string) => { return { url: x } }
    let result = (await (resolve("ior:esm:git:tla.EAM.Once", { conditions: [''], importAssertions: {}, parentURL: '' }, defaultResolve)));
    expect(result.url).toBe('../../')

})
