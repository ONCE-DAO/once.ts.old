import { Client } from './Client.interface.js'
import { IOR } from './IOR.interface.js'
import { Thing } from './Thing.interface.js'

/**
 * doc loader config
 */
export type LoaderConfig = {
    /** doc for prop 1 */
    prop1: string
}

export interface Loader extends Thing {
    canLoad(ior: IOR): Number
    /**
     * doc load
     * @param ior ior ...
     * @param config pleas insert valid config
     */
    load(ior: IOR, config?: LoaderConfig): Promise<String>;
    client(): Client
}
