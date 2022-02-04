import Url from "../../../src/2_systems/Things/Url.class";


describe("Url Class", () => {
  test("default Init", async () => {

    let url = new Url().init("google.de");

    expect(url.hostName).toEqual("google.de");
  });

  test("set href", async () => {

    let url = new Url().init("google.de");
    url.href = "test.wo-da.de";

    expect(url.hostName).toEqual("test.wo-da.de");
  });


  var validate = [];
  validate.push({
    url: "ior:ude:rest:http://localhost:8080/ior/131cac9f-ceb3-401f-a866-73f7a691fed7",
    result: {
      protocol: ["ior", "ude", "rest", "http"],
      hostName: "localhost",
      port: 8080,
      pathName: "/ior/131cac9f-ceb3-401f-a866-73f7a691fed7",
      origin: "http://localhost:8080",
    },
  });

  validate.push({
    url: "ior:ude:rest:http://test.wo-da.de/ior/131cac9f-ceb3-401f-a866-73f7a691fed7",
    result: {
      protocol: ["ior", "ude", "rest", "http"],
      hostName: "test.wo-da.de",
      pathName: "/ior/131cac9f-ceb3-401f-a866-73f7a691fed7",
      origin: "http://test.wo-da.de",
    },
  });

  validate.push({
    url: "/ior/131cac9f-ceb3-401f-a866-73f7a691fed7",
    result: {
      protocol: [],
      pathName: "/ior/131cac9f-ceb3-401f-a866-73f7a691fed7",
      isIOR: false,
    },
  });

  validate.push({
    url: "ior:ude:rest:http://localhost:8080/testdir/testfile.txt?test=foo#ActionDo=run",
    result: {
      protocol: ["ior", "ude", "rest", "http"],
      pathName: "/testdir/testfile.txt",
      fileName: "testfile.txt",
      fileType: "txt",
      search: "test=foo",
      searchParameters: { test: "foo" },
      hash: "ActionDo=run",
      host: "localhost:8080",
      port: 8080,
      originPath: 'http://localhost:8080/testdir/testfile.txt',
      normalizeHref: "http://localhost:8080/testdir/testfile.txt?test=foo#ActionDo=run",
      origin: "http://localhost:8080",
      hostName: "localhost",
      href: "ior:ude:rest:http://localhost:8080/testdir/testfile.txt?test=foo#ActionDo=run",
      isIOR: true,
    },
  });

  validate.push({
    url: "https://localhost:8443/EAMD.ucp/Components/org/shift/EAM/5_ux/ShifterNetwork/4.3.0/src/html/ShifterNetwork.html#",
    result: {
      protocol: ["https"],
      pathName:
        "/EAMD.ucp/Components/org/shift/EAM/5_ux/ShifterNetwork/4.3.0/src/html/ShifterNetwork.html",
      fileName: "ShifterNetwork.html",
      fileType: "html",
      search: "",
      searchParameters: {},
      hash: "",
      host: "localhost:8443",
      port: 8443,
      normalizeHref:
        "https://localhost:8443/EAMD.ucp/Components/org/shift/EAM/5_ux/ShifterNetwork/4.3.0/src/html/ShifterNetwork.html",
      origin: "https://localhost:8443",
      hostName: "localhost",
      href: "https://localhost:8443/EAMD.ucp/Components/org/shift/EAM/5_ux/ShifterNetwork/4.3.0/src/html/ShifterNetwork.html",
    },
  });

  validate.push({
    url: "https://shifter.staging.shiftphones.com:30484/",
    result: {
      protocol: ["https"],
      pathName: "/",
      fileName: null,
      fileType: null,
      search: "",
      searchParameters: {},
      hash: undefined,
      host: "shifter.staging.shiftphones.com:30484",
      port: 30484,
      normalizeHref: "https://shifter.staging.shiftphones.com:30484/",
      origin: "https://shifter.staging.shiftphones.com:30484",
      hostName: "shifter.staging.shiftphones.com",
      href: "https://shifter.staging.shiftphones.com:30484/",
    },
  });

  for (let testConfig of validate) {
    describe("Test Parser URL: " + testConfig.url, () => {
      let url = new Url().init(testConfig.url);
      for (const [key, value] of Object.entries(testConfig.result)) {
        test(`Teste ${key} = ${value}`, () => {
          // @ts-ignore
          expect(url[key]).toEqual(value);
        });
      }
    });
  }
});
