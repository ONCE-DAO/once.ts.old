import { IOR } from './IOR.interface'
export interface Thing {
    id:string|undefined
    name:string|undefined
    discover(): Promise<IOR[]>
}
