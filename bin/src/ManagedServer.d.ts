import * as Parser from 'dab.irc.parser/src';
import * as Core from 'dab.irc.core/src';
import { ChannelManager } from './ChannelManager';
import { ManagedUser } from './ManagedUser';
export declare class ManagedServer extends Parser.ParserServer {
    channels: Core.Channel[];
    users: {
        [key: string]: ManagedUser;
    };
    me: Core.User;
    constructor(host: string, connection: Core.Connection, chanManager: ChannelManager, parser?: Parser.DynamicParser);
    modeChanged(modes: Core.Mode[]): void;
    private removeMode(mode);
    private addMode(mode);
    findMode(mode: Core.Mode): number;
    private _manager;
    private _me;
}
