import { Thing } from "..";
import { EventServiceConsumer } from "./EventService.interface";

export default interface UcpModel extends EventServiceConsumer, Thing<UcpModel> {
    model: any;
    changelog: any; // UcpModelChangeLog | undefined
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

export type UcpModelChangelog = {
    [key: string]: UcpModelChangelog | Wave
}


export enum UcpModelTransactionStates {
    TRANSACTION_OPEN = "transactionOpen",
    BEFORE_CHANGE = "beforeChange",
    ON_CHANGE = "onChange",
    AFTER_CHANGE = "afterChange",
    TRANSACTION_CLOSED = "transactionClosed",
    TRANSACTION_ROLLBACK = "transactionRollback",
}

export enum UcpModelEvents {
    ON_MODEL_CHANGED = 'onModelChanges',
    ON_MODEL_WILL_CHANGE = 'onModelWillChange'
}