"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ManagedUser_1 = require('./ManagedUser');
var ManagedChannelUser = (function (_super) {
    __extends(ManagedChannelUser, _super);
    function ManagedChannelUser(usr, chan) {
        _super.call(this, usr.nick, usr.ident, usr.host);
        this.channels = usr.channels;
        this.channel = chan;
    }
    Object.defineProperty(ManagedChannelUser.prototype, "modes", {
        get: function () {
            return this.channels[this.channel];
        },
        enumerable: true,
        configurable: true
    });
    return ManagedChannelUser;
}(ManagedUser_1.ManagedUser));
exports.ManagedChannelUser = ManagedChannelUser;
//# sourceMappingURL=ManagedChannelUser.js.map