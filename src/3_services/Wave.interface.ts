import { UcpModelChangeLogMethods } from "./UcpModel.interface";

export default interface Wave {
    to: any,
    key: string[],
    method: UcpModelChangeLogMethods,
    from: any,
    time: number
}