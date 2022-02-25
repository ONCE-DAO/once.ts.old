import { Person } from "../UCP/UcpComponentSupport";



describe("UcpComponentSupport", () => {

  test("create Person", async () => {
    let person = new Person();
    console.log("test: create Person: this.name", person.firstName);
    //expect(loader).toBeInstanceOf(EAMDLoader);
  })
  
});
