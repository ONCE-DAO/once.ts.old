export class NpmPackage {

  protected static _store: { [index: string]: NpmPackage } = {};
  path?: string;
  name?: string;
  version?: string;
  namespace?: string;
  linkPackage?: boolean;




  static getByPackage(path: string, name: string, version: string): NpmPackage {
    const nameString = `${path}.${name}[${version}]`
    let npmPackageInstance = this._store[nameString];

    if (npmPackageInstance === undefined) {

      npmPackageInstance = new NpmPackage().init(path, name, version);
      this._store[nameString] = npmPackageInstance;
    }
    return npmPackageInstance
  }

  init(path: string, name: string, version: string) {
    this.path = path;
    this.name = name;
    this.version = version;
    return this;
  }

}
