
export default interface UcpModel {
    model: any;
    changeLog: any; // UcpModelChangeLog | undefined
    toJson: string;
    destroy(): void;
    startTransaction(): void;
    processTransaction(): void;
    rollbackTransaction(): void;
    transactionState: UcpModelTransactionStates;
}

export enum UcpModelChangeLogMethods { "set" = "set", "delete" = "delete", "create" = "create" }
export interface Wave {
    to: any,
    key: string[],
    method: UcpModelChangeLogMethods,
    from: any,
    time: number
}

export type UcpModelChangeLog = {
    [key: string]: UcpModelChangeLog | Wave
}


export enum UcpModelTransactionStates {
    TRANSACTION_OPEN,
    BEFORE_CHANGE,
    ON_CHANGE,
    AFTER_CHANGE,
    TRANSACTION_CLOSED,
    TRANSACTION_ROLLBACK,
}