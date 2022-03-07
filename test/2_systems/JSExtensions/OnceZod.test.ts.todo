import { oz } from "../../../src/2_systems/JSExtensions/OnceZod"
import DefaultIOR from "../../../src/2_systems/Things/DefaultIOR.class";

describe("Once Zod Extensions", () => {
    describe("IOR", () => {
        test("INIT", async () => {
            const onceZodIorInstance = oz.ior();

            expect(onceZodIorInstance).toBeInstanceOf(oz.OnceZodIor);
        })

        test("parse IOR Object", async () => {
            const onceZodIorInstance = oz.ior();

            const iorInstance = new DefaultIOR().init("test.wo-da.de")
            let result = onceZodIorInstance.parse(iorInstance);
            expect(result).toBe(iorInstance);
        })

        test("parse IOR String", async () => {
            const onceZodIorInstance = oz.ior();

            const iorString = "ior:https://test.wo-da.de"
            let result = onceZodIorInstance.parse(iorString);
            if ("href" in result) {
                expect(result.href).toBe(iorString);
            } else {
                throw new Error("Missing href");
            }
        })

        test("parse Object with IOR", async () => {
            const onceZodIorInstance = oz.ior();

            const iorInstance = new DefaultIOR().init("ior:https://test.wo-da.de")

            const object = { IOR: iorInstance }
            let result = onceZodIorInstance.parse(object);
            if ("IOR" in result) {
                expect(result.IOR).toBe(iorInstance);
            } else {
                throw new Error("Missing href");
            }
        })

        test("parse wrong String (Error)", async () => {
            const onceZodIorInstance = oz.ior();

            const iorString = "test.wo-da.de"
            let result = onceZodIorInstance.safeParse(iorString);
            expect(result.success).toBe(false);
            if (result.success == false)
                expect(result.error.issues[0].message).toBe("Not a IOR String");
        })

        test("parse wrong Object (Error)", async () => {
            const onceZodIorInstance = oz.ior();

            const iorInstance = { test: 'me' }
            let result = onceZodIorInstance.safeParse(iorInstance);
            expect(result.success).toBe(false);
            if (result.success == false)
                expect(result.error.issues[0].message).toBe("Not an IOR Type");
        })

        test("optional", async () => {
            const onceZodIorInstance = oz.ior().optional();

            let result = onceZodIorInstance.safeParse(undefined);
            expect(result.success).toBe(true);
        })


    })
})