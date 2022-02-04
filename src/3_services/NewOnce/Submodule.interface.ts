export default interface Submodule {
  path: string | undefined;
  installDependencies(eamdPath:string): void;
  build(eamdPath:string): void;
  watch(eamdPath:string): Promise<void>;
  init(path: string): Promise<Submodule>;
  addFromRemoteUrl(args: AddSubmoduleArgs): Promise<Submodule>;
}

export type AddSubmoduleArgs = {
  url: string;
  branch?: string;
  overwrite?: { name: string; namespace: string };
};