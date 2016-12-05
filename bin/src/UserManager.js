"use strict";
const ManagedUser_1 = require('./ManagedUser');
const ManagedChannelUser_1 = require('./ManagedChannelUser');
class UserManager {
    constructor() {
        this._allUsers = {};
    }
    byNick(nick) {
        return this._allUsers[nick];
    }
    byChannelArray(channel) {
        let result = [];
        let ch = channel.display.toLocaleLowerCase();
        for (var i in this._allUsers) {
            if (this._allUsers[i].channels[ch]) {
                result.push(new ManagedChannelUser_1.ManagedChannelUser(this._allUsers[i], ch));
            }
        }
        return result;
    }
    get all() {
        return this._allUsers;
    }
    byChannelDictionary(channel) {
        let result = {};
        let ch = channel.display.toLocaleLowerCase();
        for (var i in this._allUsers) {
            if (this._allUsers[i].channels[ch]) {
                result[this._allUsers[i].nick] = new ManagedChannelUser_1.ManagedChannelUser(this._allUsers[i], ch);
            }
        }
        return result;
    }
    nameAdd(who, channel) {
        console.log(who.toString());
        if (!this._allUsers[who.nick]) {
            this._allUsers[who.nick] = (who instanceof ManagedUser_1.ManagedUser ? who : new ManagedUser_1.ManagedUser(who.nick, who.ident, who.host));
        }
        this._allUsers[who.nick].join(channel.display);
        this._allUsers[who.nick].modeChanged(channel.display, who.modes);
    }
    join(msg, channel) {
        let who = msg.from;
        if (!this._allUsers[who.nick]) {
            this._allUsers[who.nick] = new ManagedUser_1.ManagedUser(who.nick, who.ident, who.host);
        }
        this._allUsers[who.nick].join(channel.display);
    }
    part(msg, channel) {
        let who = msg.from;
        if (!this._allUsers[who.nick]) {
            throw new Error("Why are we seeing a part from a user not recorded? " + who.nick);
        }
        this._allUsers[who.nick].part(channel.display);
    }
    rename(from, to) {
        let user = this._allUsers[from];
        if (!user)
            throw new Error("Why is there no user found during a nick change? " + from + " to " + to + ". Nicks: " + Object.keys(this._allUsers).join(","));
        delete this._allUsers[from];
        user.nick = to;
        this._allUsers[to] = user;
    }
}
exports.UserManager = UserManager;
//# sourceMappingURL=UserManager.js.map