"use strict";
const Core = require('dab.irc.core/src');
class ManagedChannel extends Core.Channel {
    constructor(display, manager, tolower = true) {
        super(display, tolower);
        this._references = 0;
        this._manager = manager;
        this.joinMe();
    }
    get users() {
        return this._manager.users.byChannelDictionary(this);
    }
    userList(fncSort = undefined) {
        return this._manager.users.byChannelArray(this).sort(fncSort);
    }
    get modes() {
        return this._modes;
    }
    get bans() {
        return this._modes.filter((v, i, a) => v.character == 'b');
    }
    get invites() {
        return this._modes.filter((v, i, a) => v.character == 'I');
    }
    get excepts() {
        return this._modes.filter((v, i, a) => v.character == 'e');
    }
    get references() {
        return this._references;
    }
    joinMe() {
        this._references++;
    }
    partMe() {
        this._references--;
        return this._references <= 0;
    }
    modeChanged(modes) {
        for (var i in modes) {
            let mode = modes[i];
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
    }
}
exports.ManagedChannel = ManagedChannel;
//# sourceMappingURL=ManagedChannel.js.map