import IOR from "../../../src/2_systems/Things/IOR.class";

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
      pathName: undefined,
      origin: undefined,
      isLoaded: false,
      namespace: "tla.EAM.Namespace",
      namespaceVersion: "#sdsgzudhsudhusidh",
      href: "ior:esm:git:tla.EAM.Namespace[#sdsgzudhsudhusidh]"
    },
  });

  for (let testConfig of validate) {
    describe("Test Parser URL: " + testConfig.url, () => {
      let url = new IOR().init(testConfig.url);
      for (const [key, value] of Object.entries(testConfig.result)) {
        // @ts-ignore
        test(`Teste ${key} : ${value}  =  ${url[key]}`, () => {
          // @ts-ignore
          expect(url[key]).toEqual(value);
        });
      }
    });
  }
});