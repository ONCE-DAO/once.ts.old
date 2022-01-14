/* eslint-disable no-unused-vars */
export enum OnceState {
    Transient,
    Discover,
    Initialized,
    RootInstallation,
    UserInstallation,
    Installed,
    NotInstalled,
    RepoInstalled,
    Started,
    AlreadyStarted,
    Stopped
}
export interface Once {
    discover(): OnceState
}
