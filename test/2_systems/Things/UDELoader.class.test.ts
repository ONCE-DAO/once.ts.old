import OnceNodeServer from "../../../src/2_systems/Once/OnceNodeServer.class";
import DefaultIOR from "../../../src/2_systems/Things/DefaultIOR.class";
import SomeExampleUcpComponent from "../../../src/2_systems/Things/SomeExampleUcpComponent.class";
import UDELoader from "../../../src/2_systems/Things/UDELoader.class";

beforeEach(async () => {
    if (typeof ONCE === "undefined") await OnceNodeServer.start();
});

describe("UDE Loader", () => {


    test("init", async () => {
        let loader = UDELoader.factory();
        expect(loader).toBeInstanceOf(UDELoader);
    })

    test("factory", async () => {
        let loader = UDELoader.factory();
        let loader2 = UDELoader.factory();

        expect(loader).toEqual(loader2);
    })

    test("canHandle", async () => {

        const ior = new DefaultIOR().init("ior:ude:localhost/UDE/12345")
        let result = UDELoader.canHandle(ior);

        expect(result).toBe(1);
    })

    test("canHandle", async () => {

        const ior = new DefaultIOR().init("ior:localhost/UDE/12345")
        let result = UDELoader.canHandle(ior);

        expect(result).toBe(0);
    })

    test("canHandle negative", async () => {

        const ior = new DefaultIOR().init("ior:localhost/UDE/12345")
        let result = UDELoader.canHandle(ior);

        expect(result).toBe(0);
    })

    test("Store create => load => load => delete", async () => {

        let ucpComponent = new SomeExampleUcpComponent();
        await ucpComponent.persistanceManager.create();


        let ucpComponentClone = await ucpComponent.IOR.clone().load();
        expect(ucpComponent).toEqual(ucpComponentClone);

        let ucpComponentClone2 = await ucpComponent.IOR.clone().load();
        expect(ucpComponentClone2).toEqual(ucpComponentClone);

        await ucpComponent.persistanceManager.delete();

        try {
            await ucpComponent.IOR.clone().load();
            throw new Error("Missing Error");
        } catch (e) {
            //@ts-ignore
            expect(e.message.match(/no such file or directory/)).toBeTruthy();
        }



    })

})