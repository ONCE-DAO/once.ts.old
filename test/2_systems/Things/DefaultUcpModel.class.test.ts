import DefaultUcpComponent from "../../../src/2_systems/Things/DefaultUcpComponent.class";

describe("Default Ucp Model", () => {
    test("int", async () => {
        let ucpComponent = new DefaultUcpComponent();

        expect(ucpComponent.model._helper?._proxyTools.isProxy).toBe(true);


        ucpComponent.model = DefaultUcpComponent.modelDefaultData;
    })
})