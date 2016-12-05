import * as Core from 'dab.irc.core/src';
import * as Parser from 'dab.irc.parser/src';

import {UserManager} from './UserManager';
import {ManagedChannel} from './ManagedChannel';

export class ChannelManager {
    get users() : UserManager {
        return this._users;
    }

    get channels() : ManagedChannel[] {
        return this._channels;
    }

    get channel() : { [key:string] : ManagedChannel } {
        return this._channelsProxy;
    }

    constructor(userManager : UserManager = new UserManager()) {
        this._users = userManager;
    }

    register(server: Parser.ParserServer) {
        server.on(Parser.Events.JOIN, this.bindJoin.bind(this));
        server.on(Parser.Events.PART, this.bindPart.bind(this));
        server.on(Parser.Events.MODE, this.bindMode.bind(this));
        server.on(Parser.Numerics.NAMREPLY, this.bindNames.bind(this));
        // We don't do nick listeners here so we can control the order of nick Events
        // and their references
        //server.on(Parser.Events.NICK, this.bindNickChange.bind(this));
    }

    unregister(server: Parser.ParserServer) {
        server.removeListener(Parser.Events.JOIN, this.bindJoin);
        server.removeListener(Parser.Events.PART, this.bindJoin);
        server.removeListener(Parser.Events.MODE, this.bindMode);
        server.removeListener(Parser.Numerics.NAMREPLY, this.bindNames);
        // We don't do nick listeners here so we can control the order of nick Events
        // and their references
        //server.removeListener(Parser.Events.NICK, this.bindNickChange);
    }

    // For when the connection joins a channel
    join(channel: Core.Channel) : boolean {
        // Check if channel is already added
        if (this._channels.filter( (v:ManagedChannel, id: number, ar:ManagedChannel[]) => v.display.toLocaleLowerCase() == channel.display.toLocaleLowerCase()).length > 0) {
            return false;
        }

        if (channel instanceof ManagedChannel) {
            this._channels.push(channel);
        }
        else {
            this._channels.push(new ManagedChannel(channel.display, this));
        }

        return true;
    }

    bindNickChange(s:Parser.ParserServer, m:Core.Message) {
        let msg = <Parser.NickChangeMessage>m;
        this._users.rename((<Core.User>msg.from).nick, msg.destination.nick);
    }

    // when another user joins
    bindJoin(s : Parser.ParserServer, m : Core.Message) {
        let msg = <Parser.ChannelUserChangeMessage>m;
        this._users.join(msg, msg.destination);
    }
    bindPart(s : Parser.ParserServer, m : Core.Message) {
        let msg = <Parser.ChannelUserChangeMessage>m;
        this._users.part(msg, msg.destination);
    }

    bindMode(s: Parser.ParserServer, m:Core.Message) {
        let msg = <Parser.ModeChangeMessage>m;

        if (msg.destination instanceof Core.Channel) {
            let ch = this._channels.filter((v,i,a) => v.display.toLocaleLowerCase() == s.display.toLocaleLowerCase());

            if (ch.length > 0) {
                ch[0].modeChanged(msg.modes);
            }
        }
    }

    bindNames(s: Parser.ParserServer, m:Core.Message) {
        let msg = <Parser.NamesMessage>m;
        for(let i in msg.users) {
            this._users.nameAdd(msg.users[i], <Core.Channel>msg.destination);
        }
    }

    part(channel: Core.Channel) : void {
        let i:any = 0;
        for(i in this._channels) {
            if (this._channels[i].display == channel.display) {
                break;
            }
        }

        let res = this._channels[i].partMe(); //.splice(i,1);
        if (res) {
            // no point keeping reference to a channel with stale data
            this._channels.splice(i,1);
        }
    }

    private _users : UserManager;
    private _channels : ManagedChannel[] = [];

    // Lets you find a channel name by lower case without reproducing this code every time.
    private _channelsProxy = new Proxy<{ [key:string] : ManagedChannel }>({}, {
            get: (proxy, name) => {
                return this._channels.filter( (c) => c.display.toLocaleLowerCase() == name.toString().toLocaleLowerCase())[0];
            }
        });
}