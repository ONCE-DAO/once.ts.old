import { Metaclass, TSClass, ClassDescription } from '../../../src/3_services/TypeDescriptor.interface';
import { Person } from "../UCP/UcpComponentSupport";



describe("UcpComponentSupport", () => {

  test("create Person", async () => {
    let person = new Person();

    console.log("test: create Person: this.name", person.firstName);
    expect(person.firstName).toBe("Me");
    //expect(person.type).toBe(undefined);
    expect(person.type).toBeInstanceOf(Metaclass);
    expect(person.type.class).toBe(Person);
    let aClass: Metaclass = person.type;
    expect(person.type.className).toBe("Metaclass Person");
    
    expect(person.tsClass).toBeInstanceOf(ClassDescription);
    expect(person.tsClass.className).toBe("TS Person");
  })
  
});
