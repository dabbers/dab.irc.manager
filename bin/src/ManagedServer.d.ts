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
    constructor(context: Core.IConnectionContext, connection: Core.Connection, parser?: Parser.DynamicParser, chanManager?: ChannelManager);
    modeChanged(modes: Core.Mode[]): void;
    private _manager;
    private _context;
}
