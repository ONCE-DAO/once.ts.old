import { BasePersistanceManager } from "../../../src/1_infrastructure/BasePersistanceManager.class";
import SomeExampleUcpComponent from "../../../src/2_systems/Things/SomeExampleUcpComponent.class";

import OnceNodeServer from "../../../src/2_systems/Once/OnceNodeServer.class";
import { InterfaceDescriptor } from "../../../src/2_systems/Things/DefaultClassDescriptor.class";

import fs from 'fs';
import DefaultIOR from "../../../src/2_systems/Things/DefaultIOR.class";
import { FilePersistanceManager } from "../../../src/2_systems/Things/FilePersistanceManager.class";
import UDELoader from "../../../src/2_systems/Things/UDELoader.class";
import exp from "constants";

beforeEach(async () => {
    if (typeof ONCE === "undefined") await OnceNodeServer.start();
});

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


    test("update on Model change", async () => {
        let ucpComponent = new SomeExampleUcpComponent();


        await ucpComponent.persistanceManager.create();

        // @ts-ignore
        let filename = await ucpComponent.persistanceManager.list[0].fileName();

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

        const myAlias = expect.getState().currentTestName + Math.round(Math.random() * 100000);
        await ucpComponent.persistanceManager.addAlias(myAlias);

        // @ts-ignore
        let filename: string = await ucpComponent.persistanceManager.list[0].fileName();

        let fileList = filename.split('/');
        let file = fileList[fileList.length - 1];

        expect(file).toBe(myAlias + '.' + id + '.json');

    });

    test("add Alias before create", async () => {
        let ucpComponent = new SomeExampleUcpComponent();


        const myAlias = expect.getState().currentTestName + Math.round(Math.random() * 100000);
        await ucpComponent.persistanceManager.addAlias(myAlias);

        await ucpComponent.persistanceManager.create();

        // @ts-ignore
        let filename = await ucpComponent.persistanceManager.list[0].fileName();

        expect(filename.match(myAlias)).toBeTruthy();

        await ucpComponent.persistanceManager.delete();
        // @ts-ignore
        expect(fs.existsSync(filename), 'File was not deleted').toBeFalsy();

    });

    test("add Alias after create", async () => {
        let ucpComponent = new SomeExampleUcpComponent();


        const myAlias = expect.getState().currentTestName + Math.round(Math.random() * 100000);
        await ucpComponent.persistanceManager.create();

        await ucpComponent.persistanceManager.addAlias(myAlias);


        // @ts-ignore
        let filename = await ucpComponent.persistanceManager.list[0].fileName();

        expect(filename.match(myAlias)).toBeTruthy();

        await ucpComponent.persistanceManager.delete();
        // @ts-ignore
        expect(fs.existsSync(filename), 'File was not deleted').toBeFalsy();

    });

})