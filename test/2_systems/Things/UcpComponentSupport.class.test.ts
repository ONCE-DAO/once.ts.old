import { Metaclass, TSClass, ClassDescription } from '../../../src/3_services/TypeDescriptor.interface';
import { Person, UcpComponent } from "../../../src/2_systems/UCP/UcpComponentSupport";



describe("UcpComponentSupport", () => {

  test("create Person", async () => {
    let person = new Person();

    console.log("test: create Person: this.name", person.firstName);
    expect(person.firstName).toBe("Me");
    //expect(person.type).toBe(undefined);
    expect(person.type).toBeInstanceOf(Metaclass);
    expect(person.type.class).toBe(Person);

    //person.type.class.helloWorld();
    //person.tsClass.jsClass.helloWorld();

    expect(person.type.extends).toBe(UcpComponent);
    let aClass: Metaclass = person.type;
    expect(person.type.className).toBe("Metaclass Person");
    
    expect(person.tsClass).toBeInstanceOf(ClassDescription);
    expect(person.tsClass).toBeInstanceOf(TSClass);
    expect(person.tsClass.jsClass).toBe(Person);
    expect(person.tsClass.className).toBe("TSClass Person");
  })
  
});


