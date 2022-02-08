import Once from "./Once.interface";

export default interface Submodule {
  path: string | undefined;
  url: string | undefined;
  branch: string | undefined;
  installDependencies(eamdPath: string): void;
  build(eamdPath: string): void;
  afterbuild(eamdPath: string): void;
  watch(eamdPath: string): Promise<void>;
  init(config: { path?: string, url?: string, branch?: string }): Promise<Submodule>;
  addFromRemoteUrl(args: AddSubmoduleArgs): Promise<Submodule>;
}

export type AddSubmoduleArgs = {
  url: string;
  once: Once;
  branch?: string;
};
