import DefaultUcpComponent from "../../../src/2_systems/Things/DefaultUcpComponent.class";

describe("Default Ucp Model", () => {
    let ucpComponent = new DefaultUcpComponent();

    test("int", async () => {
        ucpComponent = new DefaultUcpComponent();
        ucpComponent.model.age = 5;
        expect(ucpComponent.model.age).toBe(5);


        ucpComponent.model = DefaultUcpComponent.modelDefaultData;
    })

    test("_helper._proxyTools.isProxy", async () => {
        expect(ucpComponent.model._helper._proxyTools.isProxy).toBe(true);
    })

    test("_helper._proxyTools.myUcpModel", async () => {
        //@ts-ignore
        expect(ucpComponent.model._helper._proxyTools.myUcpModel).toMatchObject(ucpComponent.ucpModel);
    })
    test("_helper._proxyTools.destroy", async () => {
        let ucpComponent = new DefaultUcpComponent();

        const model = ucpComponent.model;
        expect(ucpComponent.model._helper._proxyTools.destroy).toBeInstanceOf(Function);

        ucpComponent.model._helper._proxyTools.destroy();

        expect(model).toStrictEqual({});

    })
    // test("_helper._proxyTools.loadIOR", async () => {
    //     expect(ucpComponent.model._helper._proxyTools.loadIOR).toBeInstanceOf(Function);
    // })
    test("_helper.multiSet", async () => {
        let ucpComponent = new DefaultUcpComponent();

        const model = ucpComponent.model;
        expect(ucpComponent.model._helper.multiSet).toBeInstanceOf(Function);

        ucpComponent.model._helper.multiSet({ age: 6, name: 'test' });

        expect(ucpComponent.model.age).toBe(6);
        expect(ucpComponent.model.name).toBe('test');


    })

    test("_helper.validate", async () => {
        let ucpComponent = new DefaultUcpComponent();

        const model = ucpComponent.model;
        expect(model._helper.validate).toBeInstanceOf(Function);

        let result = model._helper.validate('age', 9);
        expect(result).toStrictEqual({ "data": 9, "success": true })

        let result2 = model._helper.validate('age', 'My Name');
        expect(result2.success).toBe(false);

        expect(result2.error.issues[0].message).toBe("Expected number, received string");


    })
})