export interface NodeLoader {
  resolve(
    specifier: string,
    context: {
      conditions: string[];
      importAssertions: object;
      parentURL: string | undefined;
    },
    defaultResolve: Function
  ): Promise<{ url: string }>;

  load(
    url: string,
    context: { format: string | null | undefined; importAssertions: any },
    defaultLoad: Function
  ): {
    format: "builtin" | "commonjs" | "json" | "module" | "wasm";
    source: string | ArrayBuffer | Int8Array;
  };
}
