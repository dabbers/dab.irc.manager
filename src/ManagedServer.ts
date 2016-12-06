import * as Parser from 'dab.irc.parser/src';
import * as Core from 'dab.irc.core/src';
import {Message} from 'dab.irc.core/src/Message';
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

    get channel() : { [key:string] : Core.Channel } {
        return this._manager.channel;
    }

    get alias() : string {
        return this._alias;
    }

    constructor(alias: string, context : Core.IConnectionContext, connection: Core.Connection, parser:Parser.DynamicParser = void 0, chanManager : ChannelManager = new ChannelManager()) {
        super(context, connection, parser);

        this._manager = chanManager;
        this._context = context;
        this._alias = alias;

        // If the manager is shared, do we want to remove channels? Let's keep a cache I guess.
        this.on(Parser.Events.PART, (s : Parser.ParserServer, m : Message) => {
            let msg = <Parser.ChannelUserChangeMessage>m;
            var from = <Core.User>msg.from;
            if (from.nick == this.me.nick) {
                this._manager.part(msg.destination);
            }
        });

        this.on(Parser.Events.JOIN, (s : Parser.ParserServer, m : Message) => {
            let msg = <Parser.ChannelUserChangeMessage>m;
            var from = <Core.User>msg.from;
            if (from.nick == this.me.nick) {
                this._manager.join(msg.destination);

                this.connection.write("MODE " + msg.destination.display + " +I");
                this.connection.write("MODE " + msg.destination.display + " +b");
                this.connection.write("MODE " + msg.destination.display + " +e");
            }
        });

        this.on(Parser.Numerics.ENDOFMOTD, (s:Parser.ParserServer, m : Message) => {
            this.connection.write("WHOIS " + m.tokenized[2]); // whois me.nick
        });
        this.on(Parser.Numerics.ERR_NOMOTD, (s:Parser.ParserServer, m : Message) => {
            this.connection.write("WHOIS " + m.tokenized[2]); // whois me.nick
        });

        this.on(Parser.Events.MODE, (s:Parser.ParserServer, m:Message) => {
            let msg = <Parser.ModeChangeMessage>m;
            
            this.modeChanged(msg.modes);
        });

        // :<sender, not you> 311 <Your Nick> <Requested Nick> <Ident> <Host> * :<Name>
        this.on(Parser.Numerics.WHOISUSER, (s:Parser.ParserServer, m:Message) => {
            if (m.tokenized[2] == m.tokenized[3]) {
                this.me.nick = m.tokenized[3];
                this.me.ident = m.tokenized[4];
                this.me.name = m.message;
                this.me.host = m.tokenized[5];
            }
        });
        
        this.on(Parser.Events.NICK, (s:Parser.ParserServer, m:Message) => {
            let msg = <Parser.NickChangeMessage>m;
            if ((<Core.User>msg.from).nick == this.me.nick) {
                this.me.nick = msg.destination.nick;
            }
        });

        this.on(Parser.Numerics.ISUPPORT, (s:Parser.ParserServer, m:Message) => {
            // The parser parses the support into the attributes before calling the event.
            // But it's possible we have an empty value here, since multiple 005 events can be called.
            if (this.attributes["CHANTYPES"]) {
                this._context.channelPrefixes = this.attributes["CHANTYPES"].split("");
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

    
    dataReceived = (data: Message) => {
        let cb = (s : Parser.ParserServer, m: Message) => {
            // Update Message references with the manager references
            
            // Don't update from reference for nick change. We want both after to only reflect the actual user
            if (!(m instanceof Parser.NickChangeMessage)) {
                this.commonMessageResolution(m);
            }

            if (m instanceof Parser.ChannelUserChangeMessage) {
                let chan = this.channel[m.destination.display];
                if (chan) {
                    m.updateDestinationReference(chan);
                }
            }
            else if (m instanceof Parser.ConversationMessage) {
                let d = m.destination instanceof Core.User ? this.users[ (<Core.User>m.destination).nick ] : this.channel[m.destination.display];
                if (d) {
                    m.updateDestinationReference(d);
                }
            }
            else if (m instanceof Parser.ModeChangeMessage) {
                let d = m.destination instanceof Core.User ? this.users[ (<Core.User>m.destination).nick ] : this.channel[m.destination.display];
                if (d) {
                    m.updateDestinationReference(d);
                }
            }
            else if (m instanceof Parser.NamesMessage) {
                let d = m.destination instanceof Core.User ? this.users[ (<Core.User>m.destination).nick ] : this.channel[m.destination.display];
                if (d) {
                    m.updateDestinationReference(d);
                }
            }
            else if (m instanceof Parser.NickChangeMessage) {
                if (m.command == "NICK") {
                    // this message is used for the NICK:<nickname> callback too. Only bind the nickchange for the original event
                    this._manager.bindNickChange(s, m);
                }
                let usr = this.users[ m.destination.nick ];
                m.updateDestinationReference(<Core.User>m.from);
            }
            else {
                throw new Error("Unknown message type passed in: " + m.toString());
            }

            this.emit(m.command, this, m);
        };

        if (!this._parser.parse(this, data, cb)) {
            let cmd = data.command;
            
            this.emit(data.command, this, data);   
        }

    }

    private commonMessageResolution(m:Message) {
        if (m.from instanceof Core.User) {
            let usr = this._manager.users.byNick((<Core.User>m.from).nick);
            if (usr) m.updateFromReference(usr); 
        }
    }

    private _manager : ChannelManager;
    private _context : Core.IConnectionContext;
    private _alias : string;
}