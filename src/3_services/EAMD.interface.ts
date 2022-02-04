
export enum EAMD_FOLDERS {
  ROOT = "EAMD.ucp",
  COMPONENTS = "Components",
  SCENARIOS = "Scenarios",
  DEV = "dev",
  DIST = "dist",
  LATEST = "latest",
  CURRENT = "current",
  MISSING_NAMESPACE="namespace.missing"
}


export interface EAMD {
  installedAt: Date | undefined;
  preferredFolder: string[];
  folder: string | undefined;
  eamdPath: string | undefined;

  install(): Promise<EAMD>;
  init(path: string): EAMD;
  update(): Promise<EAMD>;
  test(): void;
}
