import { BasePersistanceManager } from "../../1_infrastructure/BasePersistanceManager.class"
import { OnceMode } from "../../3_services/Once.interface";
import { UcpModelChangelog } from "../../3_services/UcpModel.interface";
import fs from "fs";
import IOR from "../../3_services/IOR.interface";
import Loader, { LoaderStatic, loadingConfig } from "../../3_services/Loader.interface";
import { UDEObject } from "../../3_services/PersistanceManager.interface";

export class FilePersistanceManager extends BasePersistanceManager {
    private static _loaderInstance: FilePersistanceManager;

    static canHandle(ior: IOR): number {
        if (ONCE && ONCE.mode === OnceMode.NODE_JS) {
            if (ior.hostName === 'localhost' && ior.id) {
                return 1;
            }
        }
        return 0;
    }

    canHandle(ior: IOR): number {
        return FilePersistanceManager.canHandle(ior);
    }

    get IOR() { return this.ucpComponent?.IOR }

    async getUdeDirectory(): Promise<string> {
        if (!ONCE) throw new Error("Missing ONCE");
        const dir = ONCE.scenarioPath;
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        return dir;
    }

    async fileName(ior?: IOR) {
        let dir = await this.getUdeDirectory();

        if (!ior) ior = this.IOR;
        if (!ior) throw new Error("Missing IOR");

        let id = ior.id;
        let fileName = id + '.json';
        let path = ior.pathName;
        if (path) {
            dir += path.replace('/' + id, '');
        }

        let file = dir + '/' + fileName;

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        return file;
    }


    async create(): Promise<void> {
        let fileName = await this.fileName();

        if (fs.existsSync(fileName)) {
            throw new Error(`File '${fileName}' already exists`);
        }

        let data = this.ucpComponentData

        fs.writeFileSync(fileName, JSON.stringify(data));

    }


    async retrieve(ior?: IOR): Promise<UDEObject> {
        let fileName = await this.fileName(ior);
        const data = JSON.parse(fs.readFileSync(fileName, 'utf-8'));

        if (this.ucpComponent) {
            this.ucpComponent.model = data.data;
        }
        return data;
    }

    async update(): Promise<void> {

        let fileName = await this.fileName();

        if (!fs.existsSync(fileName)) {
            throw new Error(`File '${fileName}' dose not exist`);
        }

        let data = this.ucpComponentData

        fs.writeFileSync(fileName, JSON.stringify(data));
    }

    async delete(): Promise<void> {
        let fileName = await this.fileName();
        fs.rmSync(fileName);
    }

    onModelChanged(changeObject: UcpModelChangelog): void {
        throw new Error("Method not implemented.");
    }
    onNotification(changeObject: UcpModelChangelog): void {
        throw new Error("Method not implemented.");
    }


}

