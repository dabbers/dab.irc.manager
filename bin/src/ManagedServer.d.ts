import * as Parser from 'dab.irc.parser/src';
import * as Core from 'dab.irc.core/src';
import { Message } from 'dab.irc.core/src/Message';
import { ChannelManager } from './ChannelManager';
import { ManagedUser } from './ManagedUser';
export declare class ManagedServer extends Parser.ParserServer {
    readonly channels: Core.Channel[];
    readonly users: {
        [key: string]: ManagedUser;
    };
    readonly me: Core.User;
    readonly channel: {
        [key: string]: Core.Channel;
    };
    readonly alias: string;
    constructor(alias: string, context: Core.IConnectionContext, connection: Core.Connection, parser?: Parser.DynamicParser, chanManager?: ChannelManager);
    modeChanged(modes: Core.Mode[]): void;
    dataReceived: (data: Message) => void;
    private commonMessageResolution(m);
    private _manager;
    private _context;
    private _alias;
}
