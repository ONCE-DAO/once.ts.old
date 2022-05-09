import { BasePersistanceManager } from "../../../src/1_infrastructure/BasePersistanceManager.class";
import DefaultUcpComponent from "../../../src/2_systems/Things/DefaultUcpComponent.class";

import FilePersistanceManager from "../../../src/2_systems/Things/FilePersistanceManager.class";
import OnceNodeServer from "../../../src/2_systems/Once/OnceNodeServer.class";
import { InterfaceDescriptor } from "../../../src/2_systems/Things/DefaultClassDescriptor.class";

describe("File PersistanceManager", () => {

    //Hack Das sollte später gelöscht werden, wenn once immer gestartet ist 
    test("start ONCE", async () => {

        await OnceNodeServer.start();
    });

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


})