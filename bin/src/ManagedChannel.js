"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Core = require('dab.irc.core/src');
var ManagedChannel = (function (_super) {
    __extends(ManagedChannel, _super);
    function ManagedChannel(display, manager, tolower) {
        if (tolower === void 0) { tolower = true; }
        _super.call(this, display, tolower);
        this._manager = manager;
    }
    Object.defineProperty(ManagedChannel.prototype, "users", {
        get: function () {
            return this._manager.users.byChannelDictionary(this);
        },
        enumerable: true,
        configurable: true
    });
    ManagedChannel.prototype.userList = function (fncSort) {
        if (fncSort === void 0) { fncSort = undefined; }
        return this._manager.users.byChannelArray(this).sort(fncSort);
    };
    Object.defineProperty(ManagedChannel.prototype, "modes", {
        get: function () {
            return this._modes;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ManagedChannel.prototype, "bans", {
        get: function () {
            return this._modes.filter(function (v, i, a) { return v.character == 'b'; });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ManagedChannel.prototype, "invites", {
        get: function () {
            return this._modes.filter(function (v, i, a) { return v.character == 'I'; });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ManagedChannel.prototype, "excepts", {
        get: function () {
            return this._modes.filter(function (v, i, a) { return v.character == 'e'; });
        },
        enumerable: true,
        configurable: true
    });
    ManagedChannel.prototype.modeChanged = function (modes) {
        for (var i in modes) {
            var mode = modes[i];
            if (mode.type == Core.ModeType.UMode) {
                continue;
            }
            if (mode.change == Core.ModeChangeType.Adding) {
                mode.addToList(this._modes);
            }
            else {
                mode.removeFromList(this._modes);
            }
        }
    };
    return ManagedChannel;
}(Core.Channel));
exports.ManagedChannel = ManagedChannel;
//# sourceMappingURL=ManagedChannel.js.map