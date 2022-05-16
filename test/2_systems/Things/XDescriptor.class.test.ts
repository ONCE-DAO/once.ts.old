import DefaultIOR from "../../../src/2_systems/Things/DefaultIOR.class"
import BaseThing from "../../../src/1_infrastructure/BaseThing.class";
import Url, { UrlID } from "../../../src/3_services/Url.interface";
import DefaultUrl from "../../../src/2_systems/Things/DefaultUrl.class";
import ClassDescriptor, { InterfaceDescriptor } from "../../../src/2_systems/Things/DefaultClassDescriptor.class";
import UcpComponentDescriptor from "../../../src/2_systems/UcpComponentDescriptor.class";



interface MyString {
  myString: string;
}

const MyStringID = InterfaceDescriptor.lastDescriptor;

interface MyString2 {
  myString: string;
}
const MyString2ID = InterfaceDescriptor.lastDescriptor;

interface MyUrl extends MyString {
  myUrl: string;
}

const MyUrlID = InterfaceDescriptor.lastDescriptor;

@ClassDescriptor.componentExport({ silent: true })
//@ts-ignore
class TestClass1 extends DefaultUrl implements MyUrl, MyString, MyString2 {
  myUrl: string = "";
  myString: string = "";

}


describe(" Descriptor", () => {

  describe("Class Descriptor", () => {


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
  describe("Interface Descriptor", () => {



    test("Interface Registration", async () => {

      let x = new TestClass1();

      UrlID

      let allInterfaces = x.classDescriptor.implementedInterfaces;
      let interfaceNameList = allInterfaces.map(x => x.name);

      expect(interfaceNameList.includes('MyString2')).toBeTruthy();
      expect(interfaceNameList.includes('MyString')).toBeTruthy();
      expect(interfaceNameList.includes('MyUrl')).toBeTruthy();
      expect(interfaceNameList.includes('Url')).toBeTruthy();
      expect(interfaceNameList.includes('JSONProvider')).toBeTruthy();


      expect(allInterfaces.length).toEqual(5);


    })

    // test("File Location", async () => {
    //   //@ts-ignore
    //   expect(TestClass1.classDescriptor.filename).toBe(import.meta.url);
    // })



    test("Interface Descriptor implementations", () => {

      expect(MyUrlID?.implementations.includes(TestClass1.classDescriptor)).toBe(true);

    })

    test("Interface Descriptor extends", () => {

      expect(MyUrlID?.extends).toMatchObject([MyStringID]);
    })

    test("Ucp Component Descriptor", () => {
      let x = new TestClass1();
      expect(x.classDescriptor.ucpComponentDescriptor).toBeInstanceOf(UcpComponentDescriptor);

    })
    test("Class in Ucp Component Descriptor", () => {
      let x = new TestClass1();
      x
      expect(x.classDescriptor.ucpComponentDescriptor).toBeInstanceOf(UcpComponentDescriptor);

      //@ts-ignore
      expect(x.classDescriptor.ucpComponentDescriptor.units.includes(TestClass1)).toBe(true);


    })

    test("ClassDescriptor implements", async () => {
      expect(MyUrlID).toBeInstanceOf(InterfaceDescriptor);

      if (MyUrlID) {

        expect(TestClass1.classDescriptor.implements(MyUrlID)).toBe(true);
      }
    })

    test("has ucpComponentDescriptor", async () => {
      expect(MyUrlID.ucpComponentDescriptor).toBeInstanceOf(UcpComponentDescriptor);
      expect(MyUrlID.packageVersion).toBe(MyUrlID.ucpComponentDescriptor.version);
      expect(MyUrlID.packageName).toBe(MyUrlID.ucpComponentDescriptor.name);
      expect(MyUrlID.packagePath).toBe(MyUrlID.ucpComponentDescriptor.srcPath);
    })
  });


  describe("UcpComponent Descriptor", () => {
    test("getUnitByName (InterfaceDescriptor)", async () => {
      let ucpComponentDescriptor = MyUrlID.ucpComponentDescriptor;

      let ID = ucpComponentDescriptor.getUnitByName("MyUrl", "InterfaceDescriptor");

      expect(ID).toBeInstanceOf(InterfaceDescriptor);
    });
  })

});