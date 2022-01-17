import { Server } from './Server.interface'
import { Thing } from './Thing.interface'

/* eslint-disable no-unused-vars */
export enum OnceInstallationMode {
    Transient,
    UserInstallation,
    RootInstallation,
    Installed,
    NotInstalled,
    RepoInstalled,
}

export enum OnceState {
    Discovered,
    Initialized,
    Started,
    Stopped
}

export enum OnceMode {
    Booting,
    Browser,
    NodeJs,
    NodeLoader,
    WebWorker,
    ServiceWorker,
    Iframe,
}
export interface Once extends Thing {
    server: Server[]
}
