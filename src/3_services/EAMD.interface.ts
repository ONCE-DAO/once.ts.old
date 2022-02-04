import GitRepository from "./GitRepository.interface";

export default interface EAMD {
  installedAt: Date | undefined;
  preferredFolder: string[];
  installationDirectory: string | undefined;
  eamdDirectory: string | undefined;
  eamdRepository: GitRepository | undefined;

  install(): Promise<EAMD>;
  hasWriteAccess(): boolean;
  isInstalled(): boolean;
  getInstalled(): Promise<EAMD>;
  init(path: string): EAMD;
  update(): Promise<EAMD>;
  test(): void;
  discover(): Promise<Object>;
  getInstallDirectory(): string | undefined;
}

export enum EAMD_FOLDERS {
  ROOT = "EAMD.ucp",
  COMPONENTS = "Components",
  SCENARIOS = "Scenarios",
  DEV = "dev",
  DIST = "dist",
  LATEST = "latest",
  CURRENT = "current",
}
