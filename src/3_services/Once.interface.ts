import { Server } from './Server.interface'
import { Thing } from './Thing.interface'

/* eslint-disable no-unused-vars */
export enum OnceInstallationMode {
    TRANSIENT,
    USER_INSTALLATION,
    ROOT_INSTALLATION,
    INSTALLED,
    NOT_INSTALLED,
    REPO_INSTALLED,
}

export enum OnceState {
    DISCOVER,
    INITIALIZED,
    STARTED,
    STOPPED
}

export enum OnceMode {
    BOOTING,
    BROWSER,
    NODE_JS,
    NODE_LOADER,
    WEB_WORKER,
    SERVICE_WORKER,
    I_FRAME,
}
export interface Once extends Thing {
    server: Server[]
}
