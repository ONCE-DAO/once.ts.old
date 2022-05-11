
import OnceNodeServer from "../../../src/2_systems/Once/OnceNodeServer.class";
import SomeExampleUcpComponent from "../../../src/2_systems/Things/SomeExampleUcpComponent.class";
beforeEach(async () => {
    if (typeof ONCE === "undefined") await OnceNodeServer.start();
});

describe("Default UcpComponent", () => {
    test("start", async () => {
        let ucpComponent = new SomeExampleUcpComponent();


        expect(ucpComponent.model.name).toBe("MyDefaultName");
        ucpComponent.model.name = 'some other Name';
        expect(ucpComponent.model.name).toBe("some other Name");
        expect(ucpComponent.model._component.name).toBe(SomeExampleUcpComponent.name)
    })
})