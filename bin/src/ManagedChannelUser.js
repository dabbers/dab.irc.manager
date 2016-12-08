"use strict";
const ManagedUser_1 = require('./ManagedUser');
class ManagedChannelUser extends ManagedUser_1.ManagedUser {
    constructor(usr, chan) {
        super(usr.nick, usr.ident, usr.host);
        this.channels = usr.channels || {};
        this.channel = chan;
    }
    get modes() {
        return this.channels[this.channel];
    }
    set modes(v) {
        if (!this.channel)
            return;
        this.channels[this.channel] = v;
    }
}
exports.ManagedChannelUser = ManagedChannelUser;
//# sourceMappingURL=ManagedChannelUser.js.map