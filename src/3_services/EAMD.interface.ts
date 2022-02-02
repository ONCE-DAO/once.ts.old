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
