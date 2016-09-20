"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Core = require('dab.irc.core/src');
var ManagedUser = (function (_super) {
    __extends(ManagedUser, _super);
    function ManagedUser() {
        _super.apply(this, arguments);
        this.channels = {};
    }
    ManagedUser.prototype.join = function (chan) {
        var channel = chan.toLocaleLowerCase();
        if (this.channels[chan]) {
            return;
        }
        this.channels[channel] = [];
        ;
    };
    ManagedUser.prototype.part = function (chan) {
        var channel = chan.toLocaleLowerCase();
        delete this.channels[channel];
    };
    ManagedUser.prototype.modeChanged = function (chan, modes) {
        for (var i in modes) {
            var mode = modes[i];
            if (mode.type != Core.ModeType.ChannelUser) {
                continue;
            }
            if (mode.change == Core.ModeChangeType.Adding) {
                mode.addToList(this.channels[chan]);
            }
            else {
                mode.removeFromList(this.channels[chan]);
            }
        }
    };
    return ManagedUser;
}(Core.User));
exports.ManagedUser = ManagedUser;
//# sourceMappingURL=ManagedUser.js.map