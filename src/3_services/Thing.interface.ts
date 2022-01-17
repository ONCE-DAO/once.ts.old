import { IOR } from './IOR.interface'
export interface Thing {
    discover(): Promise<IOR[]>
}
