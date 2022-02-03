

describe('Url Class', () => {
    test('test', async () => {

        let Url = (await import("../../../src/2_systems/Things/Url.class")).default;

        let url = new Url().init('google.de');
        //let Url = (await import("../../../src/2_systems/Things/Url.class")).default;

        expect(url.hostName).toEqual('google.de');
    });
});

