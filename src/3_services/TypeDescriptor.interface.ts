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


class ClassDescription extends Constructor  {
  protected _type: Constructor;
  classDescription: ClassDescription
  extends: TSClass | undefined = undefined

  properties: PropertyBehavior[] = []

  relationships: RelationshipBehavior[] = []
  collections: CollectionBehavior[] = []
  
  methods: Method[] = []

  constructor(c: Constructor) {
    super()
    this._type =new TSClass(c);
    this.classDescription = this.type as ClassDescription
    this.extends = c.prototype;
  }

  get type(): Constructor {
      return this._type
  }

  getSourceCode() {
    return this.type.toString();
  }
}

class Metaclass extends ClassDescription {
  protected _type: TSClass;

    constructor(c: Constructor) {
        super(c)
        this._type = new TSClass(c);
        this.extends = c.prototype;
    }
    
    get type(): Constructor {
      return this._type
    }

    get class(): Constructor {
      return this._type
    }
}

// TODO REFACTOR make sure TSClass comes form the TS framework
export class TSClass extends ClassDescription implements TypeDescriptor {
  metaclass: Metaclass;
  protected _type: Constructor;

  constructor(c: Constructor) {
      super(c)
      this.metaclass = new Metaclass(this);
      this.extends = c.prototype
      this._type = c
  }
  extends: TSClass | undefined;


  get className() {
    return "TS "+this.type.name;
  }

  get class(): TSClass {
    return this
  }

}
export default interface TypeDescriptor extends ClassDescription{
  extends: TSClass | undefined;
  class: TSClass;

}
