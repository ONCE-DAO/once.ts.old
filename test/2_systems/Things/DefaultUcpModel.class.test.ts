import DefaultUcpComponent from "../../../src/2_systems/Things/DefaultUcpComponent.class";
import DefaultUcpModel from "../../../src/2_systems/Things/DefaultUcpModel.class";
import { UcpModelChangeLogMethods, UcpModelEvents, UcpModelTransactionStates } from "../../../src/3_services/UcpModel.interface";

describe("Default Ucp Model", () => {

    test("int", async () => {
        let ucpComponent = new DefaultUcpComponent();

        expect(ucpComponent.model).toMatchObject(DefaultUcpComponent.modelDefaultData);

        //@ts-ignore Look into protected
        expect(ucpComponent.ucpModel._history.length).toBe(1);

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
            expect(ucpComponent.ucpModel._history.length).toBe(2);


            expect(ucpComponent.ucpModel.transactionState).toBe(UcpModelTransactionStates.TRANSACTION_CLOSED);


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

        test("Multi Changes in one Transaction", async () => {
            let ucpComponent = new DefaultUcpComponent();
            const ucpModel = ucpComponent.ucpModel as DefaultUcpModel<any>;
            const model = ucpComponent.model;

            model.age = 5;
            expect(ucpModel.transactionState).toBe(UcpModelTransactionStates.TRANSACTION_CLOSED);
            expect(ucpModel.changelog).toMatchObject({ "age": { "from": undefined, "key": ["age"], "method": "create", "to": 5 } });

            ucpModel.startTransaction();
            expect(ucpModel.transactionState).toBe(UcpModelTransactionStates.TRANSACTION_OPEN);
            //@ts-ignore
            expect(ucpModel.latestParticle.snapshot).toBe(undefined);
            //@ts-ignore
            const transactionId = ucpModel.latestParticle.id;

            model.age = 10;
            expect(ucpModel.transactionState).toBe(UcpModelTransactionStates.TRANSACTION_OPEN);

            model._helper?.multiSet({ myName: 'test', subOptions: { someString: 'test' } });
            expect(ucpModel.transactionState).toBe(UcpModelTransactionStates.TRANSACTION_OPEN);

            //@ts-ignore
            expect(ucpModel.latestParticle.id).toBe(transactionId);


            ucpModel.processTransaction();
            expect(ucpModel.transactionState).toBe(UcpModelTransactionStates.TRANSACTION_CLOSED);
            expect(ucpModel.changelog).toMatchObject(
                {
                    "age": { "from": 5, "key": ["age"], "method": "set", "to": 10 },
                    "myName": { "from": undefined, "key": ["myName"], "method": "create", "to": "test" }
                }
            );

        })

    })
    describe("Model Functions", () => {
        test("destroy", async () => {
            let ucpComponent = new DefaultUcpComponent();
            ucpComponent.model.age = 5;

            let ucpModel = ucpComponent.ucpModel;
            ucpModel.destroy();
            expect(ucpModel.model).toBe(undefined);
            expect(() => { ucpModel.changelog }).toThrowError(/Cannot read properties of undefined/);
            expect(ucpModel.toJson).toBe(undefined);

        })

        test("toJson", async () => {
            let ucpComponent = new DefaultUcpComponent();
            ucpComponent.model.age = 5;
            ucpComponent.model.inventory = [{ name: 'test', itemId: 5 }, { name: 'test2', itemId: 35 }];

            expect(ucpComponent.ucpModel.toJson).toBe('{"_component":{"name":"DefaultUcpComponent"},"name":"MyDefaultName","age":5,"inventory":[{"name":"test","itemId":5},{"name":"test2","itemId":35}]}');

        })
    })


    describe("Events", () => {
        test("Event onModelWillChange", async () => {
            let ucpComponent = new DefaultUcpComponent();

            let result: any;
            const callback = (event: any, data: any) => {
                result = data;
            }

            ucpComponent.ucpModel.eventSupport.addEventListener(ucpComponent.ucpModel, UcpModelEvents.ON_MODEL_WILL_CHANGE, callback, ucpComponent.ucpModel)
            ucpComponent.model.age = 10;

            expect(result).not.toBe(undefined);
        })

        test("Event onModelChanged", async () => {
            let ucpComponent = new DefaultUcpComponent();

            let result: any;
            const callback = (event: any, data: any) => {
                result = data;
            }

            ucpComponent.ucpModel.eventSupport.addEventListener(ucpComponent.ucpModel, UcpModelEvents.ON_MODEL_CHANGED, callback, ucpComponent.ucpModel)
            ucpComponent.model.age = 10;

            expect(result).not.toBe(undefined);
        })
    })

    describe("Helper Functions", () => {

        test("_helper._proxyTools.isProxy", async () => {
            let ucpComponent = new DefaultUcpComponent();

            expect(ucpComponent.model._helper?._proxyTools.isProxy).toBe(true);
        })

        test("_helper._proxyTools.myUcpModel", async () => {
            let ucpComponent = new DefaultUcpComponent();

            //@ts-ignore
            expect(ucpComponent.model._helper?._proxyTools.myUcpModel).toMatchObject(ucpComponent.ucpModel);
        })
        test("_helper._proxyTools.destroy", async () => {
            let ucpComponent = new DefaultUcpComponent();

            const model = ucpComponent.model;
            expect(ucpComponent.model._helper?._proxyTools.destroy).toBeInstanceOf(Function);

            ucpComponent.model._helper?._proxyTools.destroy();

            expect(model).toEqual({});

        })
        // test("_helper._proxyTools.loadIOR", async () => {
        //     expect(ucpComponent.model._helper?._proxyTools.loadIOR).toBeInstanceOf(Function);
        // })
        test("_helper.multiSet", async () => {
            let ucpComponent = new DefaultUcpComponent();
            const ucpModel = ucpComponent.ucpModel;
            expect(ucpModel.transactionState).toBe(UcpModelTransactionStates.TRANSACTION_CLOSED);

            const model = ucpComponent.model;
            expect(ucpComponent.model._helper?.multiSet).toBeInstanceOf(Function);

            ucpComponent.model._helper?.multiSet({ age: 6, name: 'test', subOptions: { someString: 'test2' } });
            expect(ucpModel.transactionState).toBe(UcpModelTransactionStates.TRANSACTION_CLOSED);

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

        test("_helper.changelog", async () => {
            let ucpComponent = new DefaultUcpComponent();

            const model = ucpComponent.model;
            model.age = 100;
            expect(ucpComponent.ucpModel.changelog).toBe(model._helper?.changelog);

            //@ts-ignore
            expect(ucpComponent.ucpModel.getChangelog()).toBe(model?._helper?.changelog);

        })

        test("_helper.changelog subElement", async () => {
            let ucpComponent = new DefaultUcpComponent();

            const model = ucpComponent.model;

            model.inventory = [{ name: 'test', itemId: 5 }, { name: 'test2', itemId: 35 }];

            //@ts-ignore
            expect(ucpComponent.ucpModel.getChangelog(['inventory'])).toBe(model.inventory?._helper?.changelog);


        })
    })

    describe("Change model", () => {
        describe("Basic Parameter", () => {

            test("set Parameter", async () => {
                let ucpComponent = new DefaultUcpComponent();

                const model = ucpComponent.model;
                model.age = 4;

                model.age = 5;

                let changelog = ucpComponent.ucpModel.changelog;

                expect(changelog?.age?.to).toBe(5);
                expect(changelog?.age?.from).toBe(4);
                expect(changelog?.age?.method).toBe(UcpModelChangeLogMethods.set);

            })




            test("set sub Parameter", async () => {
                let ucpComponent = new DefaultUcpComponent();

                const model = ucpComponent.model;
                model.subOptions = {};

                model.subOptions.someString = "data";
                let changelog = ucpComponent.ucpModel.changelog;

                expect(model.subOptions.someString).toBe("data");

                expect(changelog?.subOptions.someString?.to).toBe("data");
                expect(changelog?.subOptions.someString?.from).toBe(undefined);
                expect(changelog?.subOptions.someString?.method).toBe(UcpModelChangeLogMethods.create);

            })



            test("delete Parameter", async () => {
                let ucpComponent = new DefaultUcpComponent();

                const model = ucpComponent.model;
                model.age = 5;
                delete model.age;

                let changelog = ucpComponent.ucpModel.changelog;

                expect(model.age).toBe(undefined);

                expect(changelog?.age?.to).toBe(undefined);
                expect(changelog?.age?.from).toBe(5);

                expect(changelog?.age?.method).toBe(UcpModelChangeLogMethods.delete);

            })
        })

        describe("Objects", () => {

            test("set sub Object", async () => {
                let ucpComponent = new DefaultUcpComponent();

                const model = ucpComponent.model;
                model.subOptions = { someString: "data" };

                expect(model.subOptions.someString).toBe("data");


                let changelog = ucpComponent.ucpModel.changelog;

                expect(changelog?.subOptions.someString?.to).toBe("data");
                expect(changelog?.subOptions.someString?.from).toBe(undefined);
                expect(changelog?.subOptions.someString?.method).toBe(UcpModelChangeLogMethods.create);

            })

            test("delete sub Object", async () => {
                let ucpComponent = new DefaultUcpComponent();

                const model = ucpComponent.model;
                model.subOptions = { someString: "data" };

                delete model.subOptions;
                expect(model.subOptions).toBe(undefined);

                let changelog = ucpComponent.ucpModel.changelog;
                expect(changelog).toMatchObject({ "subOptions": { "from": { "someString": "data" }, "key": ["subOptions"], "method": "delete", "to": undefined } });

            })

            test("set wrong type (Runtime Error)", async () => {
                let ucpComponent = new DefaultUcpComponent();

                const model = ucpComponent.model;

                //@ts-ignore
                expect(() => { model.subOptions = 123 }).toThrowError(/Type ZodObject expected. Got a number/);


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

                expect(model.inventory).toEqual([]);

            })

            test("set empty Array", async () => {
                let ucpComponent = new DefaultUcpComponent();

                const model = ucpComponent.model;
                model.inventory = [];

                expect(model.inventory).toEqual([]);

            })

            test("set filled Array", async () => {
                let ucpComponent = new DefaultUcpComponent();

                const model = ucpComponent.model;
                model.inventory = [{ name: 'test', itemId: 5 }, { name: 'test2', itemId: 35 }];

                expect(model.inventory).toEqual([{ name: 'test', itemId: 5 }, { name: 'test2', itemId: 35 }]);


                let changelog = ucpComponent.ucpModel.changelog;
                expect(changelog?.inventory).toMatchObject(
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
                expect(model.inventory).toEqual([{ name: 'test', itemId: 5 }, { name: 'test5', itemId: 35 }]);


                let changelog = ucpComponent.ucpModel.changelog;
                expect(changelog?.inventory).toMatchObject(
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


                expect(model.inventory).toEqual([{ name: 'test', itemId: 5 }, { name: 'test5', itemId: 35 }]);

                model.inventory.pop();
                expect(model.inventory).toEqual([{ name: 'test', itemId: 5 }]);


                let changelog = ucpComponent.ucpModel.changelog;
                expect(changelog?.inventory).toMatchObject({
                    "1":
                    {
                        "from": { "itemId": 35, "name": "test5" },
                        "key": ["inventory", "1"], "method": "delete", "to": undefined
                    }
                }
                );
            })

        })

        describe("Map", () => {
            test("Init Map", async () => {
                let ucpComponent = new DefaultUcpComponent();

                const model = ucpComponent.model;
                model.someMap = new Map();
                expect(model.someMap.get).toBeInstanceOf(Function)
            })

            test("Map set", async () => {
                let ucpComponent = new DefaultUcpComponent();

                const model = ucpComponent.model;
                model.someMap = new Map();
                model.someMap.set('my Key', 12345);

                expect(model.someMap.get('my Key')).toBe(12345)

            })

            test("Map delete", async () => {
                let ucpComponent = new DefaultUcpComponent();

                const model = ucpComponent.model;
                model.someMap = new Map();
                model.someMap.set('my Key', 12345);
                model.someMap.delete('my Key');


                expect(model.someMap.get('my Key')).toBe(undefined);

            })
        })

    })



})