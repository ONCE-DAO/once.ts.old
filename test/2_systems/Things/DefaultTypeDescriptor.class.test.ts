import DefaultIOR from "../../../src/2_systems/Things/DefaultIOR.class"
import DefaultTypeDescriptor from "../../../src/2_systems/Things/DefaultTypeDescriptor.class";

describe("DefaultTypeDescriptor", () => {


  test("new DefaultTypeDescriptor", async () => {
    let td = new DefaultTypeDescriptor().init(DefaultIOR);
    expect(td).toBeInstanceOf(DefaultTypeDescriptor);
  })
  test("TypeDescriptor on Class", async () => {
    expect(DefaultIOR.typeDescriptor).toBeInstanceOf(DefaultTypeDescriptor);
  })
  test("TypeDescriptor on Class", async () => {
    let ior = new DefaultIOR();
    expect(ior.typeDescriptor).toBeInstanceOf(DefaultTypeDescriptor);
  })
})