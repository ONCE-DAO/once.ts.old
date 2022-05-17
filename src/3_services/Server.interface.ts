
export type ServerStatusType = ("running" | "stopped" | "starting")

export default interface Server {
  start(options?: any): Promise<any>
  stop(): Promise<any>
  status: ServerStatusType
}