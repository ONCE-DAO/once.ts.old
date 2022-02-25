interface Behaviour {
  get name(): String
  get type(): Constructor
}

class FunctionBehavior extends Function implements Behaviour {
  get type(): Constructor {
    return this.constructor as Constructor;
  }
}

class Constructor extends Function {

}

class ConstructorBehaviour extends Constructor  implements Behaviour {
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

  init(aName:String, aClass: TSClass) {
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

export class InterfaceList extends Set<Interface> {}

export class ClassDescription extends Constructor  {
  protected _jsClass: Constructor ;
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
    this.extends = c.prototype;
  }

  get class(): TSClass {
      return (this._jsClass as TSClass)
  }

  getSourceCode() {
    return this.class.toString();
  }
}

export class Metaclass extends ClassDescription {
    protected _jsClass: Constructor;
    static store: Map<Constructor,Metaclass>=new Map();

    
    static getClass(c: Constructor): Metaclass {
      let aClass: Metaclass | undefined = undefined;

      if (Metaclass.store.has(c)) {
        aClass = Metaclass.store.get(c);
      }

      if (!aClass) {
        aClass = new TSClass(c);
        Metaclass.store.set(c, aClass);
      }

      return aClass as Metaclass
    }

    constructor(c: Constructor) {
        super(c)
        this._jsClass = c;
        this.extends = c.prototype;
    }
    
    get class(): TSClass {
      return (this._jsClass as TSClass) // Metaclass.getClass(this._jsClass) as TSClass//
    }

    get type(): Metaclass {
      return (this._jsClass as Metaclass)
    }

    get className() {
      return "Metaclass "+this.class.name;
    }
}

// TODO 
// REFACTOR make sure TSClass comes form the TS framework
export class TSClass  extends Metaclass implements TypeDescriptor {
  metaclass: Metaclass
  extends: TSClass;
  implements: Set<Interface>;

  constructor(c: Constructor) {
      super(c)
      this.metaclass = this as Metaclass;
      this.extends = c.prototype
      //this._type = c
  }

  get className() {
    return "TS "+this.class.name;
  }

  get type(): TSClass {
    return this
  }

}
export default interface TypeDescriptor extends ClassDescription{
  extends: TSClass | undefined;
  type: TSClass;

}
