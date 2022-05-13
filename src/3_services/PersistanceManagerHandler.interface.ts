import PersistanceManager from "./PersistanceManager.interface";

export interface PersistanceManagerHandler {
    create(): Promise<any[]>;
    retrieve(): Promise<any[]>;
    update(): Promise<any[]>;
    delete(): Promise<any[]>;
    list: PersistanceManager[];

    addAlias(alias: string): Promise<any[]>;
    removeAlias(alias: string): Promise<any[]>;

    // await(): Promise<any[]>;
}