import DefaultIOR from "../../../src/2_systems/Things/DefaultIOR.class"
import DefaultClassDescriptor, { DefaultInterfaceDescriptor } from "../../../src/2_systems/Things/DefaultClassDescriptor.class";
import BaseThing from "../../../src/1_infrastructure/BaseThing.class";
import Url from "../../../src/3_services/Url.interface";
import DefaultUrl from "../../../src/2_systems/Things/DefaultUrl.class";

describe("DefaultClassDescriptor", () => {


  test("new DefaultClassDescriptor", async () => {
    let td = new DefaultClassDescriptor().init(DefaultIOR);
    expect(td).toBeInstanceOf(DefaultClassDescriptor);
  })

  test("ClassDescriptor on Class (Static)", async () => {
    expect(DefaultIOR.classDescriptor).toBeInstanceOf(DefaultClassDescriptor);
  })

  test("ClassDescriptor on Instance", async () => {
    let ior = new DefaultIOR();
    expect(ior.classDescriptor).toBeInstanceOf(DefaultClassDescriptor);
  })

  describe("Interface Descriptor", () => {

    DefaultInterfaceDescriptor.getOrCreateInterfaceByName("MyString")
    interface MyString {
      myString: string;
    }

    DefaultInterfaceDescriptor.getOrCreateInterfaceByName("MyUrl").addExtension(["MyString"]);
    interface MyUrl extends MyString {
      myUrl: string;
    }

    let interfaceList = ['MyUrl']
    @DefaultClassDescriptor.addInterfaces(interfaceList)
    //@ts-ignore
    class TestClass1 extends DefaultUrl implements MyUrl {
      myUrl: string = "";
      myString: string = "";

    }

    test("Interface Registration", async () => {

      let x = new TestClass1();
      expect(x.classDescriptor.implements[0].name).toEqual('MyUrl');
      expect(x.classDescriptor.implements[1].name).toEqual('MyString');

    })

    test("Interface Descriptor getInterfaceByName", () => {

      const interfaceDescriptor = DefaultInterfaceDescriptor.getInterfaceByName("MyUrl");
      expect(interfaceDescriptor).toBeInstanceOf(DefaultInterfaceDescriptor);
    })

    test("Interface Descriptor implementations", () => {
      const interfaceDescriptor = DefaultInterfaceDescriptor.getInterfaceByName("MyUrl");

      expect(interfaceDescriptor?.implementations.includes(TestClass1.classDescriptor)).toBe(true);

    })

    test("Interface Descriptor extends", () => {
      const interfaceDescriptor = DefaultInterfaceDescriptor.getInterfaceByName("MyUrl");
      const myStringDescriptor = DefaultInterfaceDescriptor.getInterfaceByName("MyString");
      expect(interfaceDescriptor?.extends).toMatchObject([myStringDescriptor]);
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