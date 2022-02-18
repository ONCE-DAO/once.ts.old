
import DefaultUcpComponent from "../../../src/2_systems/Things/DefaultUcpComponent.class";

describe("Default UcpComponent", () => {
    test("start", async () => {
        let ucpComponent = new DefaultUcpComponent();

        expect(ucpComponent.model.name).toBe("DefaultUcpComponent");
        ucpComponent.model.name = 'some other Name';
        expect(ucpComponent.model.name).toBe("some other Name");

    })
})