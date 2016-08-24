import * as Core from 'dab.irc.core/src';
import { ChannelManager } from './ChannelManager';
import { ManagedUser } from './ManagedUser';
export declare class ManagedChannel extends Core.Channel {
    users: {
        [key: string]: ManagedUser;
    };
    userList(fncSort?: (a: ManagedUser, b: ManagedUser) => number): ManagedUser[];
    modes: Core.Mode[];
    bans: Core.Mode[];
    invites: Core.Mode[];
    excepts: Core.Mode[];
    constructor(display: string, manager: ChannelManager, tolower?: boolean);
    modeChanged(modes: Core.Mode[]): void;
    private removeMode(mode);
    private addMode(mode);
    findMode(mode: Core.Mode): number;
    private _users;
    private _modes;
    private _manager;
}
