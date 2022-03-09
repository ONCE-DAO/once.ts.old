interface Behaviour {
  get name(): String
  get type(): Constructor
}

class FunctionBehavior extends Function implements Behaviour {
  get type(): Constructor {
    return this.constructor as Constructor;
  }
}

abstract class Constructor extends Function {
  //  abstract get __proto__(): Constructor
}

class ConstructorBehaviour extends Constructor implements Behaviour {
  // get __proto__(): Constructor {
  //   return this.__proto__
  // }
  get type(): Constructor {
    return this.constructor as Constructor;
  }
}

class PropertyBehavior implements Behaviour {
  private _name: String

  constructor() {
    this._name = 'uninitialized'
  }
  get type(): Constructor {
    return this.constructor as Constructor;
  }

  init(aName: String, aClass: TSClass) {
    this._name = aName;
  }

  get name() {
    return this._name
  }
}

class RelationshipBehavior implements Behaviour {
  private _name: any;
  get type(): Constructor {
    return this.constructor as Constructor;
  }
  get name() {
    return this._name
  }

}

// TODO Array of relationships
// Object with keys: Map extends Collection
class CollectionBehavior implements Behaviour {
  private _name: any;
  get type(): Constructor {
    return this.constructor as Constructor;
  }
  get name() {
    return this._name
  }

}


class Method extends FunctionBehavior {

}

export abstract class Interface {
  name: String = typeof this
}

export class InterfaceList extends Set<Interface> { }

export class ClassDescription extends Constructor {
  protected _jsClass: Constructor;
  classDescription: ClassDescription
  extends: TSClass | undefined = undefined

  properties: PropertyBehavior[] = []

  relationships: RelationshipBehavior[] = []
  collections: CollectionBehavior[] = []

  methods: Method[] = []

  constructor(c: Constructor) {
    super()
    this._jsClass = c;
    this.classDescription = this as ClassDescription
    // HACK
    // @ts-ignore
    this.extends = c.__proto__;
  }

  get jsClass(): Constructor {
    return this._jsClass
  }

  getSourceCode() {
    return this.jsClass.toString();
  }
}

export class Metaclass extends ClassDescription {
  protected _jsClass: Constructor;
  static store: Map<Constructor, TSClass> = new Map();


  static getClass(c: Constructor): TSClass {
    let aClass: TSClass | undefined = undefined;

    if (Metaclass.store.has(c)) {
      aClass = Metaclass.store.get(c);
    }

    if (!aClass) {
      aClass = new TSClass(c);
      Metaclass.store.set(c, aClass);
    }

    return aClass
  }

  constructor(c: Constructor) {
    super(c)
    this._jsClass = c;
    // HACK
    // @ts-ignore
    this.extends = c.__proto__;
  }

  get class(): TSClass {
    return (this._jsClass as TSClass) // Metaclass.getClass(this._jsClass) as TSClass//
  }

  get type(): Metaclass {
    return (this._jsClass as Metaclass)
  }

  get className() {
    return "Metaclass " + this.jsClass.name;
  }
}

// TODO 
// REFACTOR make sure TSClass comes form the TS framework
export class TSClass extends ClassDescription implements TypeDescriptor {
  metaclass: Metaclass
  extends: TSClass;
  //implements: Set<Interface>;

  constructor(c: Constructor) {
    super(c)
    this.metaclass = new Metaclass(c);
    // HACK
    // @ts-ignore
    this.extends = c.__proto__ //Metaclass.getClass(c.__proto__)
    //this._type = c
  }

  get jsClass() {
    return this._jsClass
  }

  get className() {
    return "TSClass " + this.jsClass.name;
  }

  get type(): TSClass {
    return this
  }

}
export default interface TypeDescriptor extends ClassDescription {
  extends: TSClass | undefined;
  type: TSClass;

}
