// @ts-nocheck
import { Thing } from "../../exports";
import { DefaultThing } from "../../exports";


export class IOR extends DefaultThing {
    static async load<T extends Thing>(url: string, name: string): Promise<{ new(): T } | undefined> {
        try {
            const imported: any = await import(url)
            return imported[name]
        }
        catch {
            // perhaps return a more specific element with error description but not for poc
            return undefined
        }
    }
}