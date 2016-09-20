import * as Parser from 'dab.irc.parser/src';
import * as Core from 'dab.irc.core/src';
import {ChannelManager} from './ChannelManager';
import {ManagedUser} from './ManagedUser';

export class ManagedServer extends Parser.ParserServer {

    get channels() : Core.Channel[] {
        return this._manager.channels;
    }
    get users() : { [key:string] : ManagedUser } {
        return this._manager.users.all;
    }

    get me() : Core.User {
        return this._context.me;
    }

    constructor(context : Core.IConnectionContext, connection: Core.Connection, parser:Parser.DynamicParser = void 0, chanManager : ChannelManager = new ChannelManager()) {
        super(context.host, connection, parser);

        this._manager = chanManager;
        this._context = context;

        this.on(Parser.Events.JOIN, (s : Parser.ParserServer, m : Core.Message) => {
            let msg = <Parser.ChannelUserChangeMessage>m;
            var from = <Core.User>msg.from;
            if (from.nick == this.me.nick) {
                this._manager.join(msg.destination);

                this.connection.write("MODE " + msg.destination.display + " +I");
                this.connection.write("MODE " + msg.destination.display + " +b");
                this.connection.write("MODE " + msg.destination.display + " +e");
            }
        });

        this.on(Parser.Numerics.ENDOFMOTD, (s:Parser.ParserServer, m : Core.Message) => {
            this.connection.write("WHOIS " + m.tokenized[2]); // whois me.nick
        });

        this.on(Parser.Events.MODE, (s:Parser.ParserServer, m:Core.Message) => {
            let msg = <Parser.ModeChangeMessage>m;
            
            this.modeChanged(msg.modes);
        });

        // :<sender, not you> 311 <Your Nick> <Requested Nick> <Ident> <Host> * :<Name>
        this.on(Parser.Numerics.WHOISUSER, (s:Parser.ParserServer, m:Core.Message) => {
            if (m.tokenized[2] == m.tokenized[3]) {
                this.me.nick = m.tokenized[3];
                this.me.ident = m.tokenized[4];
                this.me.name = m.message;
                this.me.host = m.tokenized[5];
            }
        });
        
        this.on(Parser.Events.NICK, (s:Parser.ParserServer, m:Core.Message) => {
            let msg = <Parser.NickChangeMessage>m;
            if ((<Core.User>msg.from).nick == this.me.nick) {
                this.me.nick = msg.destination.nick;
            }
        });

        // Register the manager last, so the manger's events get called after our own. We do some setup
        // here that needs to be done before the manager does its thing.
        this._manager.register(this);
    }


    modeChanged(modes: Core.Mode[]) {
        for(var i in modes) {
            let mode = modes[i];

            if (mode.type != Core.ModeType.UMode) {
                continue;
            }

            if (mode.change == Core.ModeChangeType.Adding) {
                mode.addToList(this.me.modes);
            }
            else {
                mode.removeFromList(this.me.modes);
            }
        }
    }

    private _manager : ChannelManager;
    private _context : Core.IConnectionContext
}