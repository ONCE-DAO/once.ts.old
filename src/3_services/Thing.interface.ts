export interface Thing {
  start(): Promise<Thing>;
}

export default Thing;