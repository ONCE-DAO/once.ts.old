import { BasePersistanceManager } from "../../../src/1_infrastructure/BasePersistanceManager.class";
import SomeExampleUcpComponent from "../../../src/2_systems/Things/SomeExampleUcpComponent.class";

import OnceNodeServer from "../../../src/2_systems/Once/OnceNodeServer.class";
import { InterfaceDescriptor } from "../../../src/2_systems/Things/DefaultClassDescriptor.class";

import fs from 'fs';
import DefaultIOR from "../../../src/2_systems/Things/DefaultIOR.class";
import { FilePersistanceManager } from "../../../src/2_systems/Things/FilePersistanceManager.class";
import UDELoader from "../../../src/2_systems/Things/UDELoader.class";

beforeEach(async () => {
    if (global.ONCE_STARTED === false) await OnceNodeServer.start();
});

let allFiles: string[] = [];

afterAll(() => {
    for (let file of allFiles) {
        if (fs.existsSync(file)) {
            fs.rmSync(file);
        }
    }
});

const getAlias = () => {
    return ("JestTest_" + expect.getState().currentTestName + Math.round(Math.random() * 100000)).replace(/ /g, '_');
}

describe("File PersistanceManager", () => {


    test("init", async () => {
        let ucpComponent = new SomeExampleUcpComponent();

        let pm = new FilePersistanceManager(ucpComponent);

        expect(pm).toBeInstanceOf(FilePersistanceManager);
    })


    test("find File PersistanceManager", async () => {
        let ucpComponent = new SomeExampleUcpComponent();

        let pm = BasePersistanceManager.getPersistenceManager(ucpComponent);

        expect(pm).toBeInstanceOf(FilePersistanceManager);
    })

    test("ucpComponent Persistance Manager", async () => {
        let ucpComponent = new SomeExampleUcpComponent();

        let pm = ucpComponent.persistanceManager;

        let iDesc = InterfaceDescriptor.getInterfaceByNameHack("PersistanceManager");
        if (!iDesc) throw new Error("Missing InterfaceDescriptor");
        expect(ucpComponent.Store.lookup(iDesc).length).toBe(1);

        expect(pm.list.length).toBeGreaterThan(-1);
        expect(pm.list[0]).toBeInstanceOf(FilePersistanceManager);
    })

    test("create / delete", async () => {
        let ucpComponent = new SomeExampleUcpComponent();
        ucpComponent.model.age = 0;


        await ucpComponent.persistanceManager.create();

        // @ts-ignore
        let filename = await ucpComponent.persistanceManager.list[0].fileName();

        allFiles.push(filename);

        // @ts-ignore
        expect(fs.existsSync(filename), 'File is Missing').toBeTruthy();

        await ucpComponent.persistanceManager.delete();
        // @ts-ignore
        expect(fs.existsSync(filename), 'File was not deleted').toBeFalsy();


    })

    test("update / load", async () => {
        let ucpComponent = new SomeExampleUcpComponent();

        ucpComponent.model.age = 1;
        await ucpComponent.persistanceManager.create();

        // @ts-ignore
        let filename = await ucpComponent.persistanceManager.list[0].fileName();
        allFiles.push(filename);

        // @ts-ignore
        expect(fs.existsSync(filename), 'File is Missing').toBeTruthy();


        ucpComponent.model.age = 10;

        await ucpComponent.persistanceManager.update();

        let ior = new DefaultIOR().init(ucpComponent.IOR.href);

        UDELoader.factory().clearStore();

        let ucpComponentClone = await ior.load();

        expect(ucpComponentClone.model.age).toEqual(ucpComponent.model.age);

        await ucpComponent.persistanceManager.delete();
        // @ts-ignore
        expect(fs.existsSync(filename), 'File was not deleted').toBeFalsy();

    })

    test("retrieve result with Alias", async () => {
        let ucpComponent = new SomeExampleUcpComponent();


        const myAlias = getAlias();
        await ucpComponent.persistanceManager.addAlias(myAlias);

        await ucpComponent.persistanceManager.create();

        // @ts-ignore
        let filename = await ucpComponent.persistanceManager.list[0].fileName();
        allFiles.push(filename);

        let result = await ucpComponent.persistanceManager.retrieve();

        expect(result[0]?.alias?.length).toBe(1);

        expect(result[0]?.alias?.[0]).toBe(myAlias);

    });


    test("update on Model change", async () => {
        let ucpComponent = new SomeExampleUcpComponent();


        await ucpComponent.persistanceManager.create();

        // @ts-ignore
        let filename = await ucpComponent.persistanceManager.list[0].fileName();
        allFiles.push(filename);

        ucpComponent.model.age = 10;

        UDELoader.factory().clearStore();

        let ior = new DefaultIOR().init(ucpComponent.IOR.href);
        let ucpComponentClone = await ior.load();

        expect(ucpComponentClone.model.age).toEqual(ucpComponent.model.age);

        await ucpComponent.persistanceManager.delete();
        // @ts-ignore
        expect(fs.existsSync(filename), 'File was not deleted').toBeFalsy();


    })


    test("File starts with Alias and ends with id", async () => {
        let ucpComponent = new SomeExampleUcpComponent();

        const id = ucpComponent.IOR.id;

        const myAlias = getAlias();
        await ucpComponent.persistanceManager.addAlias(myAlias);

        // @ts-ignore
        let filename: string = await ucpComponent.persistanceManager.list[0].fileName();

        let fileList = filename.split('/');
        let file = fileList[fileList.length - 1];

        expect(file).toBe(myAlias + '.' + id + '.json');

    });

    test("add Alias before create", async () => {
        let ucpComponent = new SomeExampleUcpComponent();


        const myAlias = getAlias();
        await ucpComponent.persistanceManager.addAlias(myAlias);

        await ucpComponent.persistanceManager.create();

        // @ts-ignore
        let filename = await ucpComponent.persistanceManager.list[0].fileName();
        allFiles.push(filename);

        expect(filename.match(myAlias)).toBeTruthy();

        await ucpComponent.persistanceManager.delete();
        // @ts-ignore
        expect(fs.existsSync(filename), 'File was not deleted').toBeFalsy();

    });



    test("add Alias after create", async () => {
        let ucpComponent = new SomeExampleUcpComponent();


        const myAlias = getAlias();
        await ucpComponent.persistanceManager.create();

        await ucpComponent.persistanceManager.addAlias(myAlias);


        // @ts-ignore
        let filename = await ucpComponent.persistanceManager.list[0].fileName();

        allFiles.push(filename);

        expect(filename.match(myAlias)).toBeTruthy();

        await ucpComponent.persistanceManager.delete();
        // @ts-ignore
        expect(fs.existsSync(filename), 'File was not deleted').toBeFalsy();

    });

    test("load with Alias => load return IOR with UUID", async () => {
        let ucpComponent = new SomeExampleUcpComponent();


        const myAlias = getAlias();
        await ucpComponent.persistanceManager.addAlias(myAlias);
        await ucpComponent.persistanceManager.create();

        // @ts-ignore
        let filename = await ucpComponent.persistanceManager.list[0].fileName();
        allFiles.push(filename);

        UDELoader.factory().clearStore();

        const aliasIOR = ucpComponent.IOR.clone();
        aliasIOR.id = myAlias;

        let componentClone = await aliasIOR.load();

        expect(componentClone.IOR.id).toBe(ucpComponent.IOR.id);

        await ucpComponent.persistanceManager.delete();
        // @ts-ignore
        expect(fs.existsSync(filename), 'File was not deleted').toBeFalsy();

    });


    test("load with Alias => get IOR with UUID in Store", async () => {
        let ucpComponent = new SomeExampleUcpComponent();


        const myAlias = getAlias();
        await ucpComponent.persistanceManager.addAlias(myAlias);
        await ucpComponent.persistanceManager.create();

        // @ts-ignore
        let filename = await ucpComponent.persistanceManager.list[0].fileName();
        allFiles.push(filename);

        UDELoader.factory().clearStore();

        const aliasIOR = ucpComponent.IOR.clone();
        aliasIOR.id = myAlias;

        let componentClone = await aliasIOR.load();

        //@ts-ignore
        let storedObject = await UDELoader.factory().instanceStore.lookup(ucpComponent.IOR.href)

        expect(storedObject).toBe(componentClone);

        await ucpComponent.persistanceManager.delete();
        // @ts-ignore
        expect(fs.existsSync(filename), 'File was not deleted').toBeFalsy();

    });

    test("Remove Alias", async () => {
        let ucpComponent = new SomeExampleUcpComponent();

        const id = ucpComponent.IOR.id;

        const myAlias = getAlias();
        await ucpComponent.persistanceManager.addAlias(myAlias);


        await ucpComponent.persistanceManager.removeAlias(myAlias);

        // @ts-ignore
        let filename: string = await ucpComponent.persistanceManager.list[0].fileName();


        let fileList = filename.split('/');
        let file = fileList[fileList.length - 1];

        expect(file).toBe(id + '.json');

    });

    test("Add alias with . => Error", async () => {
        let ucpComponent = new SomeExampleUcpComponent();

        try {
            await ucpComponent.persistanceManager.addAlias('some.test');
            throw new Error("Missing Error");
        } catch (err) {
            //@ts-ignore
            expect(err.message).toBe("No '.' are allowed in alias")
        }

    });

})