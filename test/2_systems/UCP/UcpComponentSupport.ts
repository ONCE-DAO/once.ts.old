import BaseThing from "../../../src/1_infrastructure/BaseThing.class";
import { Interface, InterfaceList } from "../../../src/3_services/TypeDescriptor.interface";


interface ViewInterface {
    name: String
}
abstract class View extends Interface {
    name: String = typeof this
}




interface ItemViewInterface extends View {
}
abstract class ItemView extends View {
    name: String = typeof this
}




interface PersisenceManager {
}
abstract class BasePersisenceManager extends Interface {
    name: String = typeof this
}

// how to define all possible interfaces....
//type InterfaceType = View | ItemView | PersisenceManager




// class MyClassDescription {
//     getClassName():String {
//         return typeof this
//     }
//     getInterfaces():InterfaceList {
//                 // //@ts-ignore
//                 // let aUcpComponent: UcpComponent =  import("ior:someClass");
//                 // let theInterfaceType: InterfaceType = View;
//                 // let anIntefaceList: InterfaceList = Reflect.metaData().get("implements");
//                 // anInterfaceList.has(theInterfaceType);
//                 // // Object.getPrototype(a).name "SomeClass"
//                 // return anIntefaceList;
//     }
// }


class RelatedObjectStore {
    /// we do not want any
    private map:Map<Interface,Set<any>>=new Map();
    add(key:Interface, value:any) {
        let theSet = this.map.get(key) || new Set();
        if (!theSet.has(value))
            theSet.add(value);
    }

    getAllKeys() {
        return this.map.keys();
    }

}


class UcpComponent extends BaseThing<UcpComponent> {

    private controller:UcpController=new UcpController();

    constructor() {
        super();
        this.addView(ItemView, new DefaultItemView())
    }
    addView(anInterface:Interface, instance: any/* T extends anInteface */) {
        console.log("InterfaceType: ", anInterface.name );
        this.controller.registerView(anInterface, new DefaultItemView())
    }
    getAllViews() {
        let theInterfaceType: Interface = View;
        let anInterfaceList: InterfaceList = new Set(); //Reflect.metadata.get("implements")
        //.metaData(this).get("implements");
        anInterfaceList.has(theInterfaceType);
        // Object.getPrototype(a).name "SomeClass"
        return anInterfaceList;
    }
}

class UcpController {
    private relatedObjectStore: RelatedObjectStore=new RelatedObjectStore();

    //                         what is this, if it is not a siple string
    //                         vvvvvvvvvvvvv
    registerView(someInterface:Interface, instance:any) {
        let relatedObjects = this.relatedObjectStore.add(someInterface, instance);

    }
    getAllViews() {
        return this.relatedObjectStore.getAllKeys()
    }
    getPM() {

    }
}

export class Person extends UcpComponent {
    public firstName: String = "Me";
}

class DefaultItemView implements View {
    name: String=typeof this;
}

