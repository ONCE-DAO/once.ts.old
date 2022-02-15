import DefaultIOR from "../../../src/2_systems/Things/DefaultIOR.class";

describe("IOR Class", () => {
  let validate = [];

  validate.push({
    url: "https://shifter.staging.shiftphones.com:30484/",
    result: {
      protocol: ["ior", "https"],
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
      href: "ior:https://shifter.staging.shiftphones.com:30484/",
    },
  });

  validate.push({
    url: "ior:ude:rest:http://test.wo-da.de/ior/131cac9f-ceb3-401f-a866-73f7a691fed7",
    result: {
      protocol: ["ior", "ude", "rest", "http"],
      hostName: "test.wo-da.de",
      pathName: "/ior/131cac9f-ceb3-401f-a866-73f7a691fed7",
      origin: "http://test.wo-da.de",
      id: "131cac9f-ceb3-401f-a866-73f7a691fed7",
      isLoaded: false,
      udeUniquePath: 'ior:/ior/131cac9f-ceb3-401f-a866-73f7a691fed7',
    },
  });

  validate.push({
    url: "ior:esm:git:tla.EAM.Once",
    result: {
      protocol: ["ior", "esm", "git"],
      hostName: undefined,
      pathName: undefined,
      origin: undefined,
      isLoaded: false,
      namespace: "tla.EAM.Once",
    },
  });

  validate.push({
    url: "ior:esm:git:tla.EAM.Once[1.0.0]",
    result: {
      protocol: ["ior", "esm", "git"],
      hostName: undefined,
      pathName: undefined,
      origin: undefined,
      isLoaded: false,
      namespace: "tla.EAM.Once",
      namespaceVersion: "1.0.0",
    },
  });

  validate.push({
    url: "ior:esm:git:tla.EAM.Once[^1.0.0]",
    result: {
      protocol: ["ior", "esm", "git"],
      hostName: undefined,
      pathName: undefined,
      origin: undefined,
      isLoaded: false,
      namespace: "tla.EAM.Once",
      namespaceVersion: "^1.0.0",
      href: "ior:esm:git:tla.EAM.Once[^1.0.0]"
    },
  });

  validate.push({
    url: "ior:esm:git:tla.EAM.Once[latest]",
    result: {
      protocol: ["ior", "esm", "git"],
      hostName: undefined,
      pathName: undefined,
      origin: undefined,
      isLoaded: false,
      namespace: "tla.EAM.Once",
      namespaceVersion: "latest",
      href: "ior:esm:git:tla.EAM.Once[latest]"
    },
  });



  validate.push({
    url: "ior:esm:git:tla.EAM.Namespace[#sdsgzudhsudhusidh]",
    result: {
      protocol: ["ior", "esm", "git"],
      hostName: undefined,
      pathName: "tla.EAM.Namespace[#sdsgzudhsudhusidh]",
      origin: undefined,
      isLoaded: false,
      namespace: "tla.EAM.Namespace",
      namespaceVersion: "#sdsgzudhsudhusidh",
      href: "ior:esm:git:tla.EAM.Namespace[#sdsgzudhsudhusidh]"
    },
  });

  validate.push({
    url: "ior:github:tla.EAM.OnceService.Once.express#/ONCE-DAO/Once.express",
    result: {
      protocol: ["ior", "esm", "git"],
      hostName: undefined,
      pathName: "tla.EAM.OnceService.Once.express",
      origin: undefined,
      isLoaded: false,
      namespace: "tla.EAM.OnceService.Once.express",
      namespaceVersion: "#sdsgzudhsudhusidh",
      href: "ior:esm:git:tla.EAM.Namespace[#sdsgzudhsudhusidh]"
    },
  });

  validate.push({
    url: "ior:http://some.host.name:1234,failoverhost:2345/route/tla.EAM.OnceService.Once.express#/ONCE-DAO/Once.express",
    result: {
      protocol: ["ior", "esm", "git"],
      host: "some.host.name:1234",
      port: 1234,
      hostName: "some.host.name",
      
      pathName: "route/tla.EAM.OnceService.Once.express#/ONCE-DAO/Once.express",      
      hash: "/ONCE-DAO/Once.express",
      anchor: "/ONCE-DAO/Once.express",

      fileName: "Once.express",
      fileType: "express",

      hosts: ["some.host.name:1234","failoverhost:2345"],
      hostNames: ["some.host.name","failoverhost"],
      ports: ["1234","2345"],

      origin: "some.host.name",
      isLoaded: false,
      namespace: "tla.EAM.OnceService.Once.express",
      namespaceVersion: "#sdsgzudhsudhusidh",
      href: "ior:http://some.host.name:1234,failoverhost:2345/route/tla.EAM.OnceService.Once.express#/ONCE-DAO/Once.express",
      normalizedHref: "http://some.host.name:1234/route/tla.EAM.OnceService.Once.express#/ONCE-DAO/Once.express"
    },
  });

    validate.push({
      url: "ior:http://some.host.name:1234,failoverhost:2345/route/some.package.file.template.html#anchorRef?param=value&param1=value1",
      result: {
        protocol: ["ior", "hhtp"],
        host: "some.host.name:1234",
        port: 1234,
        hostName: "some.host.name",
        
        path: "route/some.package.file.template.html#anchorRef?param=value&param1=value1", //neu
        pathName: "route/some.package.file.template.html",      
        hash: "anchorRef",
        anchor: "anchorRef",                                     //neu
  
        fileName: "some.package.file.template.html",
        fileType: "html",

        fileTypes: ["some","package","file","template","html"],  //neu
  
        hosts: ["some.host.name:1234","failoverhost:2345"],      //neu
        hostNames: ["some.host.name","failoverhost"],            //neu
        ports: ["1234","2345"],

        origin: "some.host.name",
        isLoaded: false,
        namespace: "some.package.file.template",
        namespaceVersion: undefined,
        href: "ior:http://some.host.name:1234,failoverhost:2345/route/some.package.file.template.html#anchorRef?param=value&param1=value1",

        search: "param=value&param=value",
        searchParameters: { param: "value", param1: "value1" }
      },
  });


  for (let testConfig of validate) {
    test("Test Parser IOR: " + testConfig.url, () => {
      let url = new DefaultIOR().init(testConfig.url);
      for (const [key, value] of Object.entries(testConfig.result)) {
        // @ts-ignore
        expect(url[key], `${key} : ${value} => ${url[key]}`).toEqual(value);
      }
    });

  }
});
