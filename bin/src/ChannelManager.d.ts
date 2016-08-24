import * as Core from 'dab.irc.core/src';
import * as Parser from 'dab.irc.parser/src';
import { UserManager } from './UserManager';
import { ManagedChannel } from './ManagedChannel';
export declare class ChannelManager {
    users: UserManager;
    channels: ManagedChannel[];
    register(server: Parser.ParserServer): void;
    unregister(server: Parser.ParserServer): void;
    join(channel: Core.Channel): boolean;
    bindJoin(s: Parser.ParserServer, m: Core.Message): void;
    bindPart(s: Parser.ParserServer, m: Core.Message): void;
    bindMode(s: Parser.ParserServer, m: Core.Message): void;
    part(channel: Core.Channel): void;
    private _users;
    private _channels;
}
