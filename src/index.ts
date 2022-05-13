import DefaultOnceConfig from "./2_systems/Once/ONCEConfig.class";
import OnceNodeServer from "./2_systems/Once/OnceNodeServer.class";
import ClassDescriptor, { InterfaceDescriptor } from "./2_systems/Things/DefaultClassDescriptor.class";
import DefaultIOR from "./2_systems/Things/DefaultIOR.class";
import SomeExampleUcpComponent from "./2_systems/Things/SomeExampleUcpComponent.class";
import Thing from "./3_services/Thing.interface";

export { Thing, DefaultIOR, InterfaceDescriptor, ClassDescriptor, SomeExampleUcpComponent, DefaultOnceConfig };

export default OnceNodeServer;