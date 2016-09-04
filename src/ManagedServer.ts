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
        return this._me;
    }

    constructor(host: string, connection: Core.Connection, parser:Parser.DynamicParser = null, chanManager : ChannelManager = new ChannelManager()) {
        super(host, connection, parser);

        this._manager = chanManager;
        this._manager.register(this);
        
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
            this.connection.write("WHOIS " + m.tokenized[2]);
        });

        this.on(Parser.Events.MODE, (s:Parser.ParserServer, m:Core.Message) => {
            let msg = <Parser.ModeChangeMessage>m;
            
            this.modeChanged(msg.modes);
        });

        // :navi.orbital.link 311 badddddd dab dabitp dab.biz * :David
        this.on(Parser.Numerics.WHOISUSER, (s:Parser.ParserServer, m:Core.Message) => {
            this._me.ident = m.tokenized[4];
            this._me.name = m.message;
            this._me.host = m.tokenized[5];
        });
    }


    modeChanged(modes: Core.Mode[]) {
        for(var i in modes) {
            let mode = modes[i];

            if (mode.type == Core.ModeType.UMode) {
                continue;
            }

            if (mode.change == Core.ModeChangeType.Adding) {
                this.addMode(mode);
            }
            else {
                this.removeMode(mode);
            }
        }
    }

    private removeMode(mode: Core.Mode) {
        let ind = this.findMode(mode);
        if (ind != -1) {
            this._me.modes.splice(ind, 1);
        }
    }

    private addMode(mode: Core.Mode) {
        if (this.findMode(mode) == -1) {
            this._me.modes.push(mode);
        }
    }

    // Finds the mode character and argument if it exists. Returns the index for it. -1 if not found.
    findMode(mode: Core.Mode) : number {
        let index = -1;
        let res = this._me.modes.filter( (v, i, a) => {
            if (v.character == mode.character && v.argument == mode.argument) {
                index = i;
                return true;
            }
            return false;
        });

        return (res.length > 0) ? index : -1;
    }

    private _manager : ChannelManager;
    private _me : Core.User;
}