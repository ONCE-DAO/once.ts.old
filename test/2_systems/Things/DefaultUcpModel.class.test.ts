import DefaultUcpComponent from "../../../src/2_systems/Things/DefaultUcpComponent.class";
import { UcpModelChangeLogMethods, UcpModelTransactionStates } from "../../../src/3_services/UcpModel.interface";

describe("Default Ucp Model", () => {
    let ucpComponent = new DefaultUcpComponent();

    test("int", async () => {
        ucpComponent = new DefaultUcpComponent();
        ucpComponent.model.age = 5;
        expect(ucpComponent.model.age).toBe(5);


        ucpComponent.model = DefaultUcpComponent.modelDefaultData;
    })


    describe("Transaction", () => {
        test("Start", async () => {
            let ucpComponent = new DefaultUcpComponent();
            ucpComponent.ucpModel.startTransaction();
            expect(ucpComponent.ucpModel.transactionState).toBe(UcpModelTransactionStates.TRANSACTION_OPEN);
        })

        test("Process", async () => {
            let ucpComponent = new DefaultUcpComponent();
            ucpComponent.ucpModel.startTransaction();
            ucpComponent.model.age = 10;

            //@ts-ignore Look into protected
            expect(ucpComponent.ucpModel.latestParticle.snapshot).toBe(undefined);
            ucpComponent.ucpModel.processTransaction();

            //@ts-ignore Look into protected
            expect(ucpComponent.ucpModel.latestParticle.snapshot.age).toBe(10);
        })

        test("Rollback", async () => {
            let ucpComponent = new DefaultUcpComponent();
            ucpComponent.model.age = 5;

            ucpComponent.ucpModel.startTransaction();
            ucpComponent.model.age = 10;

            expect(ucpComponent.model.age).toBe(10);
            ucpComponent.ucpModel.rollbackTransaction();

            expect(ucpComponent.model.age).toBe(5);
        })

    })


    describe("Helper Functions", () => {

        test("_helper._proxyTools.isProxy", async () => {
            expect(ucpComponent.model._helper?._proxyTools.isProxy).toBe(true);
        })

        test("_helper._proxyTools.myUcpModel", async () => {
            //@ts-ignore
            expect(ucpComponent.model._helper?._proxyTools.myUcpModel).toMatchObject(ucpComponent.ucpModel);
        })
        test("_helper._proxyTools.destroy", async () => {
            let ucpComponent = new DefaultUcpComponent();

            const model = ucpComponent.model;
            expect(ucpComponent.model._helper?._proxyTools.destroy).toBeInstanceOf(Function);

            ucpComponent.model._helper?._proxyTools.destroy();

            expect(model).toStrictEqual({});

        })
        // test("_helper._proxyTools.loadIOR", async () => {
        //     expect(ucpComponent.model._helper?._proxyTools.loadIOR).toBeInstanceOf(Function);
        // })
        test("_helper.multiSet", async () => {
            let ucpComponent = new DefaultUcpComponent();

            const model = ucpComponent.model;
            expect(ucpComponent.model._helper?.multiSet).toBeInstanceOf(Function);

            ucpComponent.model._helper?.multiSet({ age: 6, name: 'test' });

            expect(ucpComponent.model.age).toBe(6);
            expect(ucpComponent.model.name).toBe('test');


        })

        test("_helper.validate", async () => {
            let ucpComponent = new DefaultUcpComponent();

            const model = ucpComponent.model;
            expect(model._helper?.validate).toBeInstanceOf(Function);

            let result = model._helper?.validate('age', 9);
            expect(result).toStrictEqual({ "data": 9, "success": true })

            let result2 = model._helper?.validate('age', 'My Name');
            expect(result2?.success).toBe(false);

            expect(result2?.error?.issues[0].message).toBe("Expected number, received string");


        })
    })

    describe("Change model", () => {
        describe("Basic Parameter", () => {

            test("set Parameter", async () => {
                let ucpComponent = new DefaultUcpComponent();

                const model = ucpComponent.model;
                model.age = 4;

                model.age = 5;

                let changeLog = ucpComponent.ucpModel.changeLog;

                expect(changeLog?.age?.to).toBe(5);
                expect(changeLog?.age?.from).toBe(4);
                expect(changeLog?.age?.method).toBe(UcpModelChangeLogMethods.set);

            })




            test("set sub Parameter", async () => {
                let ucpComponent = new DefaultUcpComponent();

                const model = ucpComponent.model;
                model.subOptions = {};

                model.subOptions.someString = "data";
                let changeLog = ucpComponent.ucpModel.changeLog;

                expect(model.subOptions.someString).toBe("data");

                expect(changeLog?.subOptions.someString?.to).toBe("data");
                expect(changeLog?.subOptions.someString?.from).toBe(undefined);
                expect(changeLog?.subOptions.someString?.method).toBe(UcpModelChangeLogMethods.create);

            })



            test("delete Parameter", async () => {
                let ucpComponent = new DefaultUcpComponent();

                const model = ucpComponent.model;
                model.age = 5;
                delete model.age;

                let changeLog = ucpComponent.ucpModel.changeLog;

                expect(model.age).toBe(undefined);

                expect(changeLog?.age?.to).toBe(undefined);
                expect(changeLog?.age?.from).toBe(5);

                expect(changeLog?.age?.method).toBe(UcpModelChangeLogMethods.delete);

            })
        })

        describe("Objects", () => {

            test("set sub Object", async () => {
                let ucpComponent = new DefaultUcpComponent();

                const model = ucpComponent.model;
                model.subOptions = { someString: "data" };

                expect(model.subOptions).toStrictEqual({ someString: "data" });


                let changeLog = ucpComponent.ucpModel.changeLog;

                expect(changeLog?.subOptions.someString?.to).toBe("data");
                expect(changeLog?.subOptions.someString?.from).toBe(undefined);
                expect(changeLog?.subOptions.someString?.method).toBe(UcpModelChangeLogMethods.create);

            })

            test("delete sub Object", async () => {
                let ucpComponent = new DefaultUcpComponent();

                const model = ucpComponent.model;
                model.subOptions = { someString: "data" };

                delete model.subOptions;
                expect(model.subOptions).toBe(undefined);

                let changeLog = ucpComponent.ucpModel.changeLog;
                expect(changeLog).toMatchObject({ "subOptions": { "from": { "someString": "data" }, "key": ["subOptions"], "method": "delete", "to": undefined } });

            })

            test("set wrong type (Runtime Error)", async () => {
                let ucpComponent = new DefaultUcpComponent();

                const model = ucpComponent.model;

                //@ts-ignore
                expect(() => { model.subOptions = 123 }).toThrowError(/Type ZodObject expected. Got number/);


            })

            test("set wrong type in Object (Runtime Error) ", async () => {
                let ucpComponent = new DefaultUcpComponent();

                const model = ucpComponent.model;

                //@ts-ignore
                expect(() => { model.inventory = [{ name: 'test', itemId4444: 5 }]; }).toThrowError("Missing the schema for the path inventory.0.itemId4444");
            })
        })


        describe("Array", () => {




            test("set empty Array", async () => {
                let ucpComponent = new DefaultUcpComponent();

                const model = ucpComponent.model;
                model.inventory = [];

                expect(model.inventory).toStrictEqual([]);

            })

            test("set empty Array", async () => {
                let ucpComponent = new DefaultUcpComponent();

                const model = ucpComponent.model;
                model.inventory = [];

                expect(model.inventory).toStrictEqual([]);

            })

            test("set filled Array", async () => {
                let ucpComponent = new DefaultUcpComponent();

                const model = ucpComponent.model;
                model.inventory = [{ name: 'test', itemId: 5 }, { name: 'test2', itemId: 35 }];

                expect(model.inventory).toStrictEqual([{ name: 'test', itemId: 5 }, { name: 'test2', itemId: 35 }]);


                let changeLog = ucpComponent.ucpModel.changeLog;
                expect(changeLog?.inventory).toMatchObject(
                    {
                        "0": {
                            "itemId": { "from": undefined, "key": ["inventory", "0", "itemId"], "method": "create", "to": 5 },
                            "name": { "from": undefined, "key": ["inventory", "0", "name"], "method": "create", "to": "test" }
                        },
                        "1": {
                            "itemId": { "from": undefined, "key": ["inventory", "1", "itemId"], "method": "create", "to": 35 },
                            "name": { "from": undefined, "key": ["inventory", "1", "name"], "method": "create", "to": "test2" }
                        }
                    }
                );

            })


            test("push in Array", async () => {
                let ucpComponent = new DefaultUcpComponent();

                const model = ucpComponent.model;
                model.inventory = [];
                model.inventory.push({ name: 'test', itemId: 5 });
                model.inventory.push({ name: 'test5', itemId: 35 });

                expect(model.inventory.length).toBe(2);
                expect(model.inventory).toStrictEqual([{ name: 'test', itemId: 5 }, { name: 'test5', itemId: 35 }]);


                let changeLog = ucpComponent.ucpModel.changeLog;
                expect(changeLog?.inventory).toMatchObject(
                    {
                        "1": {
                            "itemId": { "from": undefined, "key": ["inventory", "1", "itemId"], "method": "create", "to": 35 },
                            "name": { "from": undefined, "key": ["inventory", "1", "name"], "method": "create", "to": "test5" }
                        }
                    }
                );

            })

            test("pop in Array", async () => {
                let ucpComponent = new DefaultUcpComponent();

                const model = ucpComponent.model;
                model.inventory = [];
                model.inventory.push({ name: 'test', itemId: 5 });
                model.inventory.push({ name: 'test5', itemId: 35 });


                expect(model.inventory).toStrictEqual([{ name: 'test', itemId: 5 }, { name: 'test5', itemId: 35 }]);

                model.inventory.pop();
                expect(model.inventory).toStrictEqual([{ name: 'test', itemId: 5 }]);


                let changeLog = ucpComponent.ucpModel.changeLog;
                expect(changeLog?.inventory).toMatchObject({
                    "1":
                    {
                        "from": { "itemId": 35, "name": "test5" },
                        "key": ["inventory", "1"], "method": "delete", "to": undefined
                    }
                }
                );
            })

        })
    })


})