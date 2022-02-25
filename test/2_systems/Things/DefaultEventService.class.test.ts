import extendedPromise from "../../../src/2_systems/JSExtensions/Promise";
import DefaultEvent from "../../../src/2_systems/Things/DefaultEvent.class";
import DefaultEventService from "../../../src/2_systems/Things/DefaultEventService.class";
import DefaultIOR from "../../../src/2_systems/Things/DefaultIOR.class";
import EventService from "../../../src/3_services/EventService.interface";


enum TestEventNames { "MY_EVENT_NAME" = "myEventName" }

describe("Default Event Service", () => {
    let es: EventService<TestEventNames>;
    test("init", async () => {
        let ior1 = new DefaultIOR().init("google.de");

        es = new DefaultEventService(ior1).init();
        expect(es).toBeInstanceOf(DefaultEventService);
    })

    let result: any;
    let ior1 = new DefaultIOR().init("google.de");
    let ior2 = new DefaultIOR().init("test.wo-da.de");
    test("addEventListener", async () => {

        let callbackFunction = (event: any, sourceObject: any, data: any) => { result = data; return "Done" }
        es.addEventListener(TestEventNames.MY_EVENT_NAME, callbackFunction, ior2);

        expect(es.getEvents()[TestEventNames.MY_EVENT_NAME]).toBeInstanceOf(DefaultEvent);
    })

    test("fire source result", async () => {


        let fireResult = es.fire(TestEventNames.MY_EVENT_NAME, "myData");

        expect(extendedPromise.isPromise(fireResult)).toBe(true);
        let awaitedFireResult = await fireResult;
        expect(awaitedFireResult).toStrictEqual(["Done"])

    })

    test("fire target result", async () => {
        expect(result).toBe("myData")

    });

    let result2: any;
    let callingEvent: DefaultEvent;
    let callingObject: any;
    result = undefined;

    let ior3 = new DefaultIOR().init("prod.wo-da.de");

    test("add second target", async () => {
        let callbackFunction = (event: any, sourceObject: any, data: any) => {
            callingEvent = event;
            callingObject = sourceObject;
            result2 = data;
            return "Done2";
        }
        es.addEventListener(TestEventNames.MY_EVENT_NAME, callbackFunction, ior3);

        expect(es.getEvents()[TestEventNames.MY_EVENT_NAME]).toBeInstanceOf(DefaultEvent);

        //@ts-ignore
        expect(es.getEvents()[TestEventNames.MY_EVENT_NAME].getCallbackFunctions().length).toBe(2);

    })
    test("fire with 2 Target Functions", async () => {
        let fireResult = es.fire(TestEventNames.MY_EVENT_NAME, "myData");

        expect(extendedPromise.isPromise(fireResult)).toBe(true);
        let awaitedFireResult = await fireResult;

        expect(awaitedFireResult).toStrictEqual(["Done", "Done2"]);
    })

    test("callback Function Parameters", async () => {
        expect(result).toBe("myData");
        expect(result2).toBe("myData");
        expect(callingEvent).toBe(es.getEvents()[TestEventNames.MY_EVENT_NAME]);
        expect(callingObject).toStrictEqual(ior1);
    })

})