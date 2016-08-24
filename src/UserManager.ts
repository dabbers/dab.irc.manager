import {ManagedUser} from './ManagedUser';
import {ManagedChannelUser} from './ManagedChannelUser';
import * as Core from 'dab.irc.core/src';
import * as Parser from 'dab.irc.parser/src';

export class UserManager {
    byNick(nick : string) : ManagedUser {
        return this._allUsers[nick];
    }

    byChannelArray(channel : Core.Channel) : ManagedChannelUser[] {
        let result:ManagedChannelUser[] = [];
        let ch = channel.display.toLocaleLowerCase();

        for(var i in this._allUsers) {
            if (this._allUsers[i].channels[ch]) {
                result.push(new ManagedChannelUser(this._allUsers[i], ch));
            }
        }

        return result;
    }

    get all() : { [key:string] : ManagedUser } {
        return this._allUsers;
    }

    byChannelDictionary(channel: Core.Channel) : {[key:string] : ManagedChannelUser} {
        let result : {[key:string] : ManagedChannelUser} = {};
        let ch = channel.display.toLocaleLowerCase();

        for(var i in this._allUsers) {
            if (this._allUsers[i].channels[ch]) {
                result[this._allUsers[i].nick] = new ManagedChannelUser(this._allUsers[i], ch);
            }
        }

        return result;
    }

    join(msg: Parser.ChannelUserChangeMessage, channel: Core.Channel) {
        let who = <Core.User>msg.from;

        if (!this._allUsers[who.nick]) {
            this._allUsers[who.nick] = new ManagedUser(who.nick, who.ident, who.host);
        }
        
        // We check if we already join the channel inside this method. No need to double check.
        this._allUsers[who.nick].join(channel.display);
    }

    part(msg: Parser.ChannelUserChangeMessage, channel: Core.Channel) {
        let who = <Core.User>msg.from;

        if (!this._allUsers[who.nick]) {
            throw new Error("Why are we seeing a part from a user not recorded?");
        }

        this._allUsers[who.nick].part(channel.display);
    }

    rename(from: string, to: string) {
        let user = this._allUsers[from];
        delete this._allUsers[from];

        user.nick = to;
        this._allUsers[to] = user;
    }

    

    private _allUsers : { [key:string] : ManagedUser } = {};
}