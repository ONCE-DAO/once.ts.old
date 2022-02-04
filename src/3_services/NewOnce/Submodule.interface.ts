export default interface Submodule {
  path: string | undefined;
  installDependencies(): Promise<void>;
  build(): Promise<void>;
  init(path: string): Promise<Submodule>;
}
