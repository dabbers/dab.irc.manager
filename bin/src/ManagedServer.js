"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Parser = require('dab.irc.parser/src');
var Core = require('dab.irc.core/src');
var ChannelManager_1 = require('./ChannelManager');
var ManagedServer = (function (_super) {
    __extends(ManagedServer, _super);
    function ManagedServer(context, connection, parser, chanManager) {
        var _this = this;
        if (parser === void 0) { parser = void 0; }
        if (chanManager === void 0) { chanManager = new ChannelManager_1.ChannelManager(); }
        _super.call(this, context.host, connection, parser);
        this._manager = chanManager;
        this._context = context;
        this.on(Parser.Events.JOIN, function (s, m) {
            var msg = m;
            var from = msg.from;
            if (from.nick == _this.me.nick) {
                _this._manager.join(msg.destination);
                _this.connection.write("MODE " + msg.destination.display + " +I");
                _this.connection.write("MODE " + msg.destination.display + " +b");
                _this.connection.write("MODE " + msg.destination.display + " +e");
            }
        });
        this.on(Parser.Numerics.ENDOFMOTD, function (s, m) {
            _this.connection.write("WHOIS " + m.tokenized[2]);
        });
        this.on(Parser.Events.MODE, function (s, m) {
            var msg = m;
            _this.modeChanged(msg.modes);
        });
        this.on(Parser.Numerics.WHOISUSER, function (s, m) {
            if (m.tokenized[2] == m.tokenized[3]) {
                _this.me.nick = m.tokenized[3];
                _this.me.ident = m.tokenized[4];
                _this.me.name = m.message;
                _this.me.host = m.tokenized[5];
            }
        });
        this.on(Parser.Events.NICK, function (s, m) {
            var msg = m;
            if (msg.from.nick == _this.me.nick) {
                _this.me.nick = msg.destination.nick;
            }
        });
        this._manager.register(this);
    }
    Object.defineProperty(ManagedServer.prototype, "channels", {
        get: function () {
            return this._manager.channels;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ManagedServer.prototype, "users", {
        get: function () {
            return this._manager.users.all;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ManagedServer.prototype, "me", {
        get: function () {
            return this._context.me;
        },
        enumerable: true,
        configurable: true
    });
    ManagedServer.prototype.modeChanged = function (modes) {
        for (var i in modes) {
            var mode = modes[i];
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
    };
    return ManagedServer;
}(Parser.ParserServer));
exports.ManagedServer = ManagedServer;
//# sourceMappingURL=ManagedServer.js.map