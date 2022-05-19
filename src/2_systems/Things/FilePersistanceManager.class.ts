import { BasePersistanceManager } from "../../1_infrastructure/BasePersistanceManager.class"
import { OnceMode } from "../../3_services/Once.interface";
import { UcpModelChangelog } from "../../3_services/UcpModel.interface";
import fs from "fs";
import IOR from "../../3_services/IOR.interface";
import { UDEObject } from "../../3_services/PersistanceManager.interface";
import UDELoader from "./UDELoader.class";
import OnceNodeServer from "../Once/OnceNodeServer.class";

export class FilePersistanceManager extends BasePersistanceManager {

    get backendActive(): boolean {
        return this.backendVersion !== undefined;
    }

    private backendVersion: string | undefined = undefined;

    static readonly _aliasSeparator: string = ".";

    static canHandle(ior: IOR): number {
        if (ONCE && (ONCE.mode === OnceMode.NODE_JS || ONCE.mode === OnceMode.NODE_LOADER)) {
            if ((ior.hostName === 'localhost' || ior.hostName == undefined) && ior.id) {
                return 1;
            }
        }
        return 0;
    }

    canHandle(ior: IOR): number {
        return FilePersistanceManager.canHandle(ior);
    }

    get IOR(): IOR & { id: string } | undefined {
        let ior = this.ucpComponent?.IOR;
        if (ior && typeof ior.id === 'undefined') throw new Error("Missing ID");
        return ior as IOR & { id: string } | undefined;
    }

    static async getUdeDirectory(): Promise<string> {
        if (!ONCE) throw new Error("Missing ONCE");
        const dir = (ONCE as OnceNodeServer).scenarioPath;
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        return dir;
    }

    async directory(ior?: IOR & { id: string }): Promise<string> {
        if (!ior) ior = this.IOR;
        if (!ior) throw new Error("Missing IOR");

        let dir = await FilePersistanceManager.getUdeDirectory();
        let path = ior.pathName;
        if (path) {
            dir = dir.replace(/\/$/, '');
            dir += path.replace(ior.id, '');
        }
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }

        return dir;
    }

    async fileName(ior?: IOR & { id: string }) {
        if (!ior) ior = this.IOR;
        if (!ior) throw new Error("Missing IOR");


        let id = ior.id;
        let aliasList = this.alias.sort(function (a, b) {
            a = a.toLowerCase();
            b = b.toLowerCase();
            if (a == b) return 0;
            if (a > b) return 1;
            return -1;
        });

        let fileName: string = '';
        if (aliasList.length > 0) fileName += aliasList.join(FilePersistanceManager._aliasSeparator) + FilePersistanceManager._aliasSeparator;
        fileName += id + '.json';


        const dir = await this.directory();

        return dir + '/' + fileName;
    }

    static async discover(ior: IOR): Promise<{ [index: string]: string }> {
        if (ior.pathName === undefined) throw new Error("Missing PathName in ior");

        let dir = await FilePersistanceManager.getUdeDirectory();
        dir += ior.pathName.replace('/' + ior.id, '');
        const files = fs.readdirSync(dir);
        const fullAliasList: { [index: string]: string } = {};
        for (const file of files) {
            if (file.endsWith('.json')) {
                const aliasList = file.substring(0, file.length - 5).split(FilePersistanceManager._aliasSeparator);
                for (const alias of aliasList) {
                    if (fullAliasList[alias] === undefined) {
                        fullAliasList[alias] = file;
                    } else {
                        console.error(`Duplicate UDE Alias! File1: ${file} / ${fullAliasList[alias]}`)
                    }
                }
            }
        }

        return fullAliasList;
    }

    static async findFile4IOR(ior: IOR): Promise<string | undefined> {
        const id = ior.id;
        if (id === undefined) throw new Error("Missing id in IOR")
        const aliasList = await this.discover(ior);
        if (aliasList[id]) {
            return aliasList[id];
        }
    }

    async addAlias(alias: string): Promise<void> {
        if (this.backendActive) {
            await this.delete();
            this.alias.push(alias);
            await this.create();
        } else {
            this.alias.push(alias);
        }
    }

    async removeAlias(alias: string): Promise<void> {
        if (this.backendActive) {
            await this.delete();
            this.alias.splice(this.alias.indexOf(alias), 1);
            await this.create();
        } else {
            this.alias.splice(this.alias.indexOf(alias), 1);
        }
    }

    async create(): Promise<void> {
        if (!this.ucpComponent || !this.IOR) throw new Error("Missing UCP Component");

        this._validateAliasList();

        let fileName = await this.fileName();

        if (fs.existsSync(fileName)) {
            throw new Error(`File '${fileName}' already exists`);
        }

        let data = this.ucpComponentData;

        fs.writeFileSync(fileName, JSON.stringify(data, null, 2));
        UDELoader.factory().addObject2Store(this.IOR, this.ucpComponent)
        this.backendVersion = data.particle.version;

    }

    private async _validateAliasList(): Promise<void> {
        const ior = this.IOR;
        if (!ior) throw new Error("Missing IOR");

        let aliasList = await FilePersistanceManager.discover(ior);

        for (let alias of [...this.alias, ior.id]) {
            if (alias) {
                if (aliasList[alias]) {
                    throw new Error(`Alias ${alias} already exists in File ${aliasList[alias]}! New IOR: ${ior.href}`);
                }
            }
        }

    }


    async retrieve(ior?: IOR & { id: string }): Promise<UDEObject> {
        let internalIOR = ior || this.IOR;
        if (!internalIOR) throw new Error("Missing IOR");

        let fileName = await FilePersistanceManager.findFile4IOR(internalIOR);
        if (!fileName) throw new Error("No file Found");

        const filepath = (await this.directory(internalIOR)) + fileName;

        const data = JSON.parse(fs.readFileSync(filepath, 'utf-8'));

        const udeObject = UDELoader.validateUDEStructure(data);
        await this.retrieveFromData(data);

        return udeObject;
    }

    async retrieveFromData(udeObject: UDEObject): Promise<UDEObject> {
        if (this.ucpComponent) {
            this.ucpComponent.model = udeObject.particle.data;
            this.backendVersion = udeObject.particle.data.version;
            if (udeObject.alias) this.alias = udeObject.alias;
        }
        return udeObject;
    }



    async update(): Promise<void> {

        if (!this.backendActive) throw new Error("Object is not persisted");

        let fileName = await this.fileName();

        if (!fs.existsSync(fileName)) {
            throw new Error(`File '${fileName}' dose not exist`);
        }

        let data = this.ucpComponentData

        fs.writeFileSync(fileName, JSON.stringify(data, null, 2));
    }

    async delete(): Promise<void> {
        if (!this.backendActive) return;

        if (!this.ucpComponent || !this.IOR) throw new Error("Missing UCP Component");

        let fileName = await this.fileName();
        fs.rmSync(fileName);
        UDELoader.factory().removeObjectFromStore(this.IOR);
        this.backendVersion = undefined;
    }



    async onModelChanged(changeObject: UcpModelChangelog): Promise<void> {
        if (this.backendVersion) {
            await this.update();
        }
    }
    onNotification(changeObject: UcpModelChangelog): Promise<void> {
        throw new Error("Method not implemented.");
    }


}

