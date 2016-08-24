"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Parser = require('dab.irc.parser/src');
var Core = require('dab.irc.core/src');
var ManagedServer = (function (_super) {
    __extends(ManagedServer, _super);
    function ManagedServer(host, connection, chanManager, parser) {
        var _this = this;
        if (parser === void 0) { parser = null; }
        _super.call(this, host, connection, parser);
        this._manager = chanManager;
        this._manager.register(this);
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
            _this._me.ident = m.tokenized[4];
            _this._me.name = m.message;
            _this._me.host = m.tokenized[5];
        });
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
            return this._me;
        },
        enumerable: true,
        configurable: true
    });
    ManagedServer.prototype.modeChanged = function (modes) {
        for (var i in modes) {
            var mode = modes[i];
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
    };
    ManagedServer.prototype.removeMode = function (mode) {
        var ind = this.findMode(mode);
        if (ind != -1) {
            this._me.modes.splice(ind, 1);
        }
    };
    ManagedServer.prototype.addMode = function (mode) {
        if (this.findMode(mode) == -1) {
            this._me.modes.push(mode);
        }
    };
    ManagedServer.prototype.findMode = function (mode) {
        var index = -1;
        var res = this._me.modes.filter(function (v, i, a) {
            if (v.character == mode.character && v.argument == mode.argument) {
                index = i;
                return true;
            }
            return false;
        });
        return (res.length > 0) ? index : -1;
    };
    return ManagedServer;
}(Parser.ParserServer));
exports.ManagedServer = ManagedServer;
