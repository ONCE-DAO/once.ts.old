import PersistanceManager from "./PersistanceManager.interface";

export interface PersistanceManagerHandler {
    create(): Promise<any[]>;
    retrieve(): Promise<any[]>;
    update(): Promise<any[]>;
    delete(): Promise<any[]>;
    list: PersistanceManager[];
    // await(): Promise<any[]>;
}