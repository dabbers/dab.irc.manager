import * as Core from 'dab.irc.core/src';
import { ChannelManager } from './ChannelManager';
import { ManagedUser } from './ManagedUser';
export declare class ManagedChannel extends Core.Channel {
    readonly users: {
        [key: string]: ManagedUser;
    };
    userList(fncSort?: (a: ManagedUser, b: ManagedUser) => number): ManagedUser[];
    readonly modes: Core.Mode[];
    readonly bans: Core.Mode[];
    readonly invites: Core.Mode[];
    readonly excepts: Core.Mode[];
    readonly references: number;
    constructor(display: string, manager: ChannelManager, tolower?: boolean);
    joinMe(): void;
    partMe(): boolean;
    modeChanged(modes: Core.Mode[]): void;
    private _users;
    private _modes;
    private _manager;
    private _references;
}
