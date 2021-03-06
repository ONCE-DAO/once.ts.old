import OnceNodeServer from "../../../src/2_systems/Once/OnceNodeServer.class";
import DefaultIOR from "../../../src/2_systems/Things/DefaultIOR.class";
import SomeExampleUcpComponent from "../../../src/2_systems/Things/SomeExampleUcpComponent.class";
import UDELoader from "../../../src/2_systems/Things/UDELoader.class";

beforeEach(async () => {
    if (ONCE_STARTED === false) await OnceNodeServer.start();
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

    test("canHandle ude", async () => {

        const ior = new DefaultIOR().init("ior:ude:localhost/UDE/12345")
        let result = UDELoader.canHandle(ior);

        expect(result).toBe(1);
    })

    test("canHandle negative", async () => {

        const ior = new DefaultIOR().init("ior:localhost/UDE/12345")
        let result = UDELoader.canHandle(ior);

        expect(result).toBe(0);
    })

    test("Store create => load => load => delete", async () => {

        this
        let ucpComponent = new SomeExampleUcpComponent();
        await ucpComponent.persistanceManager.create();


        let ucpComponentClone = await ucpComponent.IOR.clone().load();
        expect(ucpComponent).toEqual(ucpComponentClone);

        let ucpComponentClone2 = await ucpComponent.IOR.clone().load();
        expect(ucpComponentClone2).toEqual(ucpComponentClone);

        await ucpComponent.persistanceManager.delete();


    })

    test("Store create => delete (Store cleaned)", async () => {

        this
        let ucpComponent = new SomeExampleUcpComponent();
        await ucpComponent.persistanceManager.create();

        await ucpComponent.persistanceManager.delete();

        try {
            await ucpComponent.IOR.clone().load();
            throw new Error("Missing Error");
        } catch (e) {
            //@ts-ignore
            expect(e.message).toBe("No file Found");
        }

    })

    test("Load with Alias", async () => {

        let ucpComponent = new SomeExampleUcpComponent();

        const myAlias = expect.getState().currentTestName + Math.round(Math.random() * 100000);
        ucpComponent.persistanceManager.addAlias(myAlias)
        await ucpComponent.persistanceManager.create();

        let loadIOR = ucpComponent.IOR.clone();
        loadIOR.id = myAlias;


        let ucpComponentClone = await loadIOR.load();
        expect(ucpComponent).toBe(ucpComponentClone);

        await ucpComponent.persistanceManager.delete();


    })

})