import DefaultIOR from "../../../src/2_systems/Things/DefaultIOR.class"
import DefaultClassDescriptor from "../../../src/2_systems/Things/DefaultClassDescriptor.class";
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

  test("Interface Registration", async () => {

    let interfaceList = ['Url']
    @DefaultClassDescriptor.addInterfaces(interfaceList)
    // @ts-ignore
    class TestClass1 extends DefaultUrl implements Url {

    }
    let x = new TestClass1();
    expect(x.classDescriptor.implements).toBe(interfaceList);
  })

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