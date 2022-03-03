import DefaultIOR from "../../../src/2_systems/Things/DefaultIOR.class"
import BaseThing from "../../../src/1_infrastructure/BaseThing.class";
import Url from "../../../src/3_services/Url.interface";
import DefaultUrl from "../../../src/2_systems/Things/DefaultUrl.class";
import ClassDescriptor, { InterfaceDescriptor } from "../../../src/2_systems/Things/DefaultClassDescriptor.class";
import UcpComponentDescriptor from "../../../src/2_systems/UcpComponentDescriptor.class";

describe("ClassDescriptor", () => {


  test("new ClassDescriptor", async () => {
    let td = new ClassDescriptor().init(DefaultIOR);
    expect(td).toBeInstanceOf(ClassDescriptor);
  })

  test("ClassDescriptor on Class (Static)", async () => {
    expect(DefaultIOR.classDescriptor).toBeInstanceOf(ClassDescriptor);
  })

  test("ClassDescriptor on Instance", async () => {
    let ior = new DefaultIOR();
    expect(ior.classDescriptor).toBeInstanceOf(ClassDescriptor);
  })

  describe("Interface Descriptor", () => {

    interface MyString {
      myString: string;
    }

    interface MyString2 {
      myString: string;
    }

    interface MyUrl extends MyString {
      myUrl: string;
    }

    @ClassDescriptor.setFilePath(__filename)
    @ClassDescriptor.componentExport({ silent: true })
    //@ts-ignore
    class TestClass1 extends DefaultUrl implements MyUrl, MyString2 {
      myUrl: string = "";
      myString: string = "";

    }

    test("Interface Registration", async () => {

      let x = new TestClass1();
      expect(x.classDescriptor.implements[0].interfaceName).toEqual('MyUrl');
      expect(x.classDescriptor.implements[1].interfaceName).toEqual('MyString');
      expect(x.classDescriptor.implements[1].interfaceName).toEqual('MyString2');

    })

    test("File Location", async () => {
      expect(TestClass1.classDescriptor.filename).toBe(__filename);
    })


    test("Interface Descriptor getInterfaceByName", () => {

      const interfaceDescriptor = InterfaceDescriptor.getInterfaceByName(InterfaceDescriptor.uniqueName("tla.EAM", "once.ts", "0.0.1", "MyUrl"));
      expect(interfaceDescriptor).toBeInstanceOf(InterfaceDescriptor);
    })

    test("Interface Descriptor implementations", () => {
      const interfaceDescriptor = InterfaceDescriptor.getInterfaceByName(InterfaceDescriptor.uniqueName("tla.EAM", "once.ts", "0.0.1", "MyUrl"));

      expect(interfaceDescriptor?.implementations.includes(TestClass1.classDescriptor)).toBe(true);

    })

    test("Interface Descriptor extends", () => {
      const interfaceDescriptor = InterfaceDescriptor.getInterfaceByName(InterfaceDescriptor.uniqueName("tla.EAM", "once.ts", "0.0.1", "MyUrl"));
      const myStringDescriptor = InterfaceDescriptor.getInterfaceByName(InterfaceDescriptor.uniqueName("tla.EAM", "once.ts", "0.0.1", "MyString"));
      expect(interfaceDescriptor?.extends).toMatchObject([myStringDescriptor]);
    })

    test("Ucp Component Descriptor", () => {
      let x = new TestClass1();

      expect(x.classDescriptor.ucpComponentDescriptor).toBeInstanceOf(UcpComponentDescriptor);

    })
    test("Class in Ucp Component Descriptor", () => {
      let x = new TestClass1();

      expect(x.classDescriptor.ucpComponentDescriptor).toBeInstanceOf(UcpComponentDescriptor);

      //@ts-ignore
      expect(x.classDescriptor.ucpComponentDescriptor.units.includes(TestClass1)).toBe(true);


    })
  });


  test("Class in ClassDescriptor", async () => {
    let ior = new DefaultIOR();
    expect(ior.classDescriptor.class).toBe(DefaultIOR);
  })

  test("ClassDescriptor extends", async () => {


    class TestClass1 extends DefaultUrl implements Url {

    }
    expect(TestClass1.classDescriptor.extends[0]).toBe(DefaultUrl);
    expect(TestClass1.classDescriptor.extends[1]).toBe(BaseThing);

  })




})