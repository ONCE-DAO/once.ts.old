import { IOR } from '../3_services/IOR.interface'
import { Thing } from '../3_services/Thing.interface'

export class DefaultThing implements Thing {
  discover (): IOR[] {
    throw new Error('Method not implemented.')
  }

  private _id: string | undefined;
  public get id (): string | undefined {
    return this._id
  }

  public set id (value: string | undefined) {
    this._id = value
  }

  private _name: string | undefined;
  public get name (): string | undefined {
    return this._name
  }

  public set name (value: string | undefined) {
    this._name = value
  }
}
