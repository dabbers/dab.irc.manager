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
            if (mode.type == Core.ModeType.UMode) {
                continue;
            }
            if (mode.change == Core.ModeChangeType.Adding) {
                this.addMode(chan, mode);
            }
            else {
                this.removeMode(chan, mode);
            }
        }
    };
    ManagedUser.prototype.removeMode = function (chan, mode) {
        var ind = this.findMode(chan, mode);
        if (ind != -1) {
            this.channels[chan].splice(ind, 1);
        }
    };
    ManagedUser.prototype.addMode = function (chan, mode) {
        if (this.findMode(chan, mode) == -1) {
            this.channels[chan].push(mode);
        }
    };
    ManagedUser.prototype.findMode = function (chan, mode) {
        var index = -1;
        var res = this.channels[chan].filter(function (v, i, a) {
            if (v.character == mode.character && v.argument == mode.argument) {
                index = i;
                return true;
            }
            return false;
        });
        return (res.length > 0) ? index : -1;
    };
    return ManagedUser;
}(Core.User));
exports.ManagedUser = ManagedUser;
