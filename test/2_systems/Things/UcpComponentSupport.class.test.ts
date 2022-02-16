
import Person from "./../../../src/2_systems/UCP/UcpComponentSupport.class"

describe("UcpComponentSupport", () => {

  test("Find Loader", async () => {
    let person = new Person()
    expect(loader).toBeInstanceOf(EAMDLoader);
  })
  
});
