import { Server } from './Server.interface'
import { Thing } from './Thing.interface'

/* eslint-disable no-unused-vars */
export enum OnceInstallationMode {
    TRANSIENT ='TRANSIENT',
    USER_INSTALLATION ='USER_INSTALLATION',
    ROOT_INSTALLATION='ROOT_INSTALLATION',
    INSTALLED='INSTALLED',
    NOT_INSTALLED='NOT_INSTALLED',
    REPO_INSTALLED='REPO_INSTALLED',
}

export enum OnceState {
    DISCOVER='DISCOVER',
    INITIALIZED='INITIALIZED',
    STARTED='STARTED',
    STOPPED='STOPPED'
}

export enum OnceMode {
    BOOTING='BOOTING',
    BROWSER='BROWSER',
    NODE_JS='NODE_JS',
    NODE_LOADER='NODE_LOADER',
    WEB_WORKER='WEB_WORKER',
    SERVICE_WORKER='SERVICE_WORKER',
    I_FRAME='I_FRAME',
}
export interface Once extends Thing {
    server: Server[]
}
