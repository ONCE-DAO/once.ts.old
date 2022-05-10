import { BasePersistanceManager } from "../../../src/1_infrastructure/BasePersistanceManager.class";
import DefaultUcpComponent from "../../../src/2_systems/Things/DefaultUcpComponent.class";

import OnceNodeServer from "../../../src/2_systems/Once/OnceNodeServer.class";
import { InterfaceDescriptor } from "../../../src/2_systems/Things/DefaultClassDescriptor.class";

import fs from 'fs';
import DefaultIOR from "../../../src/2_systems/Things/DefaultIOR.class";
import { FilePersistanceManager } from "../../../src/2_systems/Things/FilePersistanceManager.class";

beforeEach(async () => {
    if (typeof ONCE === "undefined") await OnceNodeServer.start();
});

describe("File PersistanceManager", () => {


    test("init", async () => {
        let ucpComponent = new DefaultUcpComponent();

        let pm = new FilePersistanceManager(ucpComponent);

        expect(pm).toBeInstanceOf(FilePersistanceManager);
    })


    test("find File PersistanceManager", async () => {
        let ucpComponent = new DefaultUcpComponent();

        let pm = BasePersistanceManager.getPersistenceManager(ucpComponent);

        expect(pm).toBeInstanceOf(FilePersistanceManager);
    })

    test("ucpComponent Persistance Manager", async () => {
        let ucpComponent = new DefaultUcpComponent();

        let pm = ucpComponent.persistanceManager;

        let iDesc = InterfaceDescriptor.getInterfaceByNameHack("PersistanceManager");
        if (!iDesc) throw new Error("Missing InterfaceDescriptor");
        expect(ucpComponent.Store.lookup(iDesc).length).toBe(1);

        expect(pm.list.length).toBeGreaterThan(-1);
        expect(pm.list[0]).toBeInstanceOf(FilePersistanceManager);
    })

    test("create / delete", async () => {
        let ucpComponent = new DefaultUcpComponent();


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
        let ucpComponent = new DefaultUcpComponent();


        await ucpComponent.persistanceManager.create();

        // @ts-ignore
        let filename = await ucpComponent.persistanceManager.list[0].fileName();

        // @ts-ignore
        expect(fs.existsSync(filename), 'File is Missing').toBeTruthy();


        ucpComponent.model.age = 10;

        await ucpComponent.persistanceManager.update();

        let ior = new DefaultIOR().init(ucpComponent.IOR.href);

        let ucpComponentClone = await ior.load();

        expect(ucpComponentClone.model.age).toEqual(ucpComponent.model.age);

        await ucpComponent.persistanceManager.delete();
        // @ts-ignore
        expect(fs.existsSync(filename), 'File was not deleted').toBeFalsy();


    })



})