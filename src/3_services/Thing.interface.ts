export interface Thing {
  start(): Promise<Thing>;
  id: string;
}

export default Thing;