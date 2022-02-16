import DefaultUrl from "../../../src/2_systems/Things/DefaultUrl.class";


describe("Url Class", () => {
  test("default Init", async () => {

    let url = new DefaultUrl().init("google.de");

    expect(url.hostName).toEqual("google.de");
  });

  test("set href", async () => {

    let url = new DefaultUrl().init("google.de");
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
      normalizedHref: "http://localhost:8080/testdir/testfile.txt?test=foo#ActionDo=run",
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
      normalizedHref:
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
      fileName: undefined,
      fileType: undefined,
      search: "",
      searchParameters: {},
      hash: undefined,
      host: "shifter.staging.shiftphones.com:30484",
      port: 30484,
      normalizedHref: "https://shifter.staging.shiftphones.com:30484/",
      origin: "https://shifter.staging.shiftphones.com:30484",
      hostName: "shifter.staging.shiftphones.com",
      href: "https://shifter.staging.shiftphones.com:30484/",
    },
  });



  validate.push({
    url: "ior:http://some.host.name:1234,failoverhost:2345/route/tla.EAM.OnceService.Once.express#/ONCE-DAO/Once.express",
    result: {
      protocol: ["ior", "http"],
      host: "some.host.name:1234",
      port: 1234,
      hostName: "some.host.name",

      path: "/route/tla.EAM.OnceService.Once.express#/ONCE-DAO/Once.express",
      pathName: "/route/tla.EAM.OnceService.Once.express",

      hash: "/ONCE-DAO/Once.express",
      anchor: "/ONCE-DAO/Once.express",

      fileName: "tla.EAM.OnceService.Once.express",
      fileType: "express",

      hosts: ["some.host.name:1234", "failoverhost:2345"],
      hostNames: ["some.host.name", "failoverhost"],
      ports: [1234, 2345],

      origin: "http://some.host.name:1234",
      namespace: undefined,
      namespaceVersion: undefined,
      href: "ior:http://some.host.name:1234,failoverhost:2345/route/tla.EAM.OnceService.Once.express#/ONCE-DAO/Once.express",
      normalizedHref: "http://some.host.name:1234/route/tla.EAM.OnceService.Once.express#/ONCE-DAO/Once.express"
    },
  });

  validate.push({
    url: "ior:http://some.host.name:1234,failoverhost:2345/route/some.package.file.template.html#anchorRef?param=value&param1=value1",
    result: {
      protocol: ["ior", "http"],
      host: "some.host.name:1234",
      port: 1234,
      hostName: "some.host.name",

      path: "/route/some.package.file.template.html?param=value&param1=value1#anchorRef", //neu
      pathName: "/route/some.package.file.template.html",
      hash: "anchorRef",
      anchor: "anchorRef",                                     //neu

      fileName: "some.package.file.template.html",
      fileType: "html",

      fileTypes: ["some", "package", "file", "template", "html"],  //neu

      hosts: ["some.host.name:1234", "failoverhost:2345"],      //neu
      hostNames: ["some.host.name", "failoverhost"],            //neu
      ports: [1234, 2345],

      origin: "http://some.host.name:1234",
      namespace: undefined,
      namespaceVersion: undefined,
      href: "ior:http://some.host.name:1234,failoverhost:2345/route/some.package.file.template.html?param=value&param1=value1#anchorRef",

      search: "param=value&param1=value1",
      searchParameters: { param: "value", param1: "value1" }
    },
  });

  for (let testConfig of validate) {
    test("Test Parser URL: " + testConfig.url, () => {
      let url = new DefaultUrl().init(testConfig.url);
      for (const [key, value] of Object.entries(testConfig.result)) {
        // @ts-ignore
        expect(url[key], `${key} : ${value} => ${url[key]}`).toEqual(value);
      }
    });
  }
});
