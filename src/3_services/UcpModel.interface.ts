
export default interface UcpModel {
    model: any;
    changeLog: UcpModelChangeLog;
    toJson: string;
    destroy(): void;

}

export enum UcpModelChangeLogMethods { "set", "delete", "create" }
export interface UcpModelChangeLogItem {
    to: any,
    key: string[],
    method: UcpModelChangeLogMethods,
    from: any,
    time: Date
}

export interface UcpModelChangeLog {
    [key: string]: UcpModelChangeLog | UcpModelChangeLogItem
}
