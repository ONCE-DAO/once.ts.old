export default interface ClassDescriptor {
  extends: any[];
  class: any;
  addSomething(...args: any[]): any;
  addInterfaces(...args: any[]): any;

  implements: any[];
}
