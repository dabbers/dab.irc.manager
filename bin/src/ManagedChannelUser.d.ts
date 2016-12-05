import * as Core from 'dab.irc.core/src';
import { ManagedUser } from './ManagedUser';
export declare class ManagedChannelUser extends ManagedUser {
    constructor(usr: ManagedUser, chan: string);
    readonly modes: Core.Mode[];
    private channel;
}
