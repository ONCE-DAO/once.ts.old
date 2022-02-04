import GitRepository from "./NewOnce/GitRepository.interface";

export default interface EAMD {
  installedAt: Date | undefined;
  preferredFolder: string[];
  installationDirectory: string;
  eamdDirectory: string;
  eamdRepository: GitRepository | undefined

  install(): Promise<EAMD>;
  init(path: string): EAMD;
  update(): Promise<EAMD>;
  test(): void;
  discover(): Promise<Object>;
  getInstallDirectory():string
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
