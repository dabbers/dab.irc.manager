"use strict";
var ManagedUser_1 = require('./ManagedUser');
var ManagedChannelUser_1 = require('./ManagedChannelUser');
var UserManager = (function () {
    function UserManager() {
        this._allUsers = {};
    }
    UserManager.prototype.byNick = function (nick) {
        return this._allUsers[nick];
    };
    UserManager.prototype.byChannelArray = function (channel) {
        var result = [];
        var ch = channel.display.toLocaleLowerCase();
        for (var i in this._allUsers) {
            if (this._allUsers[i].channels[ch]) {
                result.push(new ManagedChannelUser_1.ManagedChannelUser(this._allUsers[i], ch));
            }
        }
        return result;
    };
    Object.defineProperty(UserManager.prototype, "all", {
        get: function () {
            return this._allUsers;
        },
        enumerable: true,
        configurable: true
    });
    UserManager.prototype.byChannelDictionary = function (channel) {
        var result = {};
        var ch = channel.display.toLocaleLowerCase();
        for (var i in this._allUsers) {
            if (this._allUsers[i].channels[ch]) {
                result[this._allUsers[i].nick] = new ManagedChannelUser_1.ManagedChannelUser(this._allUsers[i], ch);
            }
        }
        return result;
    };
    UserManager.prototype.nameAdd = function (who, channel) {
        if (!this._allUsers[who.nick]) {
            this._allUsers[who.nick] = (who instanceof ManagedUser_1.ManagedUser ? who : new ManagedUser_1.ManagedUser(who.nick, who.ident, who.host));
        }
        this._allUsers[who.nick].join(channel.display);
        this._allUsers[who.nick].modeChanged(channel.display, who.modes);
    };
    UserManager.prototype.join = function (msg, channel) {
        var who = msg.from;
        if (!this._allUsers[who.nick]) {
            this._allUsers[who.nick] = new ManagedUser_1.ManagedUser(who.nick, who.ident, who.host);
        }
        this._allUsers[who.nick].join(channel.display);
    };
    UserManager.prototype.part = function (msg, channel) {
        var who = msg.from;
        if (!this._allUsers[who.nick]) {
            throw new Error("Why are we seeing a part from a user not recorded? " + who.nick);
        }
        this._allUsers[who.nick].part(channel.display);
    };
    UserManager.prototype.rename = function (from, to) {
        var user = this._allUsers[from];
        if (!user)
            throw new Error("Why is there no user found during a nick change? " + from + " to " + to);
        delete this._allUsers[from];
        user.nick = to;
        this._allUsers[to] = user;
    };
    return UserManager;
}());
exports.UserManager = UserManager;
//# sourceMappingURL=UserManager.js.map