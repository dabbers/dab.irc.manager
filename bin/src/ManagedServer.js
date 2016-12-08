"use strict";
const Parser = require('dab.irc.parser/src');
const Core = require('dab.irc.core/src');
const ChannelManager_1 = require('./ChannelManager');
class ManagedServer extends Parser.ParserServer {
    constructor(alias, context, connection, parser = void 0, chanManager = new ChannelManager_1.ChannelManager()) {
        super(context, connection, parser);
        this.dataReceived = (data) => {
            let cb = (s, m) => {
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
                    let d = (m.destination instanceof Core.User ?
                        (this.me.nick == m.destination.target ? this.users[m.from.target] : this.users[m.destination.nick])
                        : this.channel[m.destination.display]);
                    if (d) {
                        m.updateDestinationReference(d);
                    }
                }
                else if (m instanceof Parser.ModeChangeMessage) {
                    let d = m.destination instanceof Core.User ? this.users[m.destination.nick] : this.channel[m.destination.display];
                    if (d) {
                        m.updateDestinationReference(d);
                    }
                }
                else if (m instanceof Parser.NamesMessage) {
                    let d = m.destination instanceof Core.User ? this.users[m.destination.nick] : this.channel[m.destination.display];
                    if (d) {
                        m.updateDestinationReference(d);
                    }
                }
                else if (m instanceof Parser.NickChangeMessage) {
                    if (m.command == "NICK") {
                        this._manager.bindNickChange(s, m);
                    }
                    let usr = this.users[m.destination.nick];
                    m.updateDestinationReference(m.from);
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
        };
        this._manager = chanManager;
        this._context = context;
        this._alias = alias;
        context.dataCallback = this.dataReceived;
        this.on(Parser.Events.PART, (s, m) => {
            let msg = m;
            var from = msg.from;
            if (from.nick == this.me.nick) {
                this._manager.part(msg.destination);
            }
        });
        this.on(Parser.Events.JOIN, (s, m) => {
            let msg = m;
            var from = msg.from;
            if (from.nick == this.me.nick) {
                this._manager.join(msg.destination);
                this.connection.write("MODE " + msg.destination.display + " +I");
                this.connection.write("MODE " + msg.destination.display + " +b");
                this.connection.write("MODE " + msg.destination.display + " +e");
            }
        });
        this.on(Parser.Numerics.ENDOFMOTD, (s, m) => {
            this.connection.write("WHOIS " + m.tokenized[2]);
        });
        this.on(Parser.Numerics.ERR_NOMOTD, (s, m) => {
            this.connection.write("WHOIS " + m.tokenized[2]);
        });
        this.on(Parser.Events.MODE, (s, m) => {
            let msg = m;
            this.modeChanged(msg.modes);
        });
        this.on(Parser.Numerics.WHOISUSER, (s, m) => {
            if (m.tokenized[2] == m.tokenized[3]) {
                this.me.nick = m.tokenized[3];
                this.me.ident = m.tokenized[4];
                this.me.name = m.message;
                this.me.host = m.tokenized[5];
            }
        });
        this.on(Parser.Events.NICK, (s, m) => {
            let msg = m;
            if (msg.from.nick == this.me.nick) {
                this.me.nick = msg.destination.nick;
            }
        });
        this.on(Parser.Numerics.ISUPPORT, (s, m) => {
            if (this.attributes["CHANTYPES"]) {
                this._context.channelPrefixes = this.attributes["CHANTYPES"].split("");
            }
        });
        this._manager.register(this);
    }
    get channels() {
        return this._manager.channels;
    }
    get users() {
        return this._manager.users.all;
    }
    get me() {
        return this._context.me;
    }
    get channel() {
        return this._manager.channel;
    }
    get alias() {
        return this._alias;
    }
    modeChanged(modes) {
        for (var i in modes) {
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
    commonMessageResolution(m) {
        if (m.from instanceof Core.User) {
            let usr = this._manager.users.byNick(m.from.nick);
            if (usr)
                m.updateFromReference(usr);
        }
    }
}
exports.ManagedServer = ManagedServer;
//# sourceMappingURL=ManagedServer.js.map