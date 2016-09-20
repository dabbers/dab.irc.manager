import { ManagedUser } from './ManagedUser';
import { ManagedChannelUser } from './ManagedChannelUser';
import * as Core from 'dab.irc.core/src';
import * as Parser from 'dab.irc.parser/src';
export declare class UserManager {
    byNick(nick: string): ManagedUser;
    byChannelArray(channel: Core.Channel): ManagedChannelUser[];
    all: {
        [key: string]: ManagedUser;
    };
    byChannelDictionary(channel: Core.Channel): {
        [key: string]: ManagedChannelUser;
    };
    nameAdd(who: Core.User | ManagedUser, channel: Core.Channel): void;
    join(msg: Parser.ChannelUserChangeMessage, channel: Core.Channel): void;
    part(msg: Parser.ChannelUserChangeMessage, channel: Core.Channel): void;
    rename(from: string, to: string): void;
    private _allUsers;
}
