export default interface Thing<T> {
  id: string;
  start(): Promise<T>;
  init(...a: any[]): any;
}
