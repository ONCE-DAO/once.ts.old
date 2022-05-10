import OnceNodeServer from "../../../src/2_systems/Once/OnceNodeServer.class";
import DefaultStore from "../../../src/2_systems/Things/DefaultStore.class";
beforeEach(async () => {
    if (typeof ONCE === "undefined") await OnceNodeServer.start();
});
describe("Default Store", () => {
    test("init", async () => {
        let store = new DefaultStore().init();
        expect(store).toBeInstanceOf(DefaultStore);
    })
    test("register (String)", async () => {
        let store = new DefaultStore().init();
        store.register('123', '5555')

        expect(store.lookup('123')).toBe('5555');
    })

    test("register (Number)", async () => {
        let store = new DefaultStore().init();
        store.register('123', 5555)

        expect(store.lookup('123')).toBe(5555);
    })

    test("remove", async () => {
        let store = new DefaultStore().init();
        store.register('123', '5555');

        store.remove('123');
        expect(store.lookup('123')).toBe(undefined);

    })
    test("discover", async () => {
        let store = new DefaultStore().init();
        store.register('123', '5555');

        expect(store.discover()).toStrictEqual([{ key: '123', value: '5555' }]);
    })

    test("clear", async () => {
        let store = new DefaultStore().init();
        store.register('123', '5555');

        store.clear();

        expect(store.discover()).toStrictEqual([]);
    })

})