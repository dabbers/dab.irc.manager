"use strict";
const Core = require('dab.irc.core/src');
class ManagedUser extends Core.User {
    constructor() {
        super(...arguments);
        this.channels = {};
    }
    join(chan) {
        let channel = chan.toLocaleLowerCase();
        if (this.channels[chan] === undefined) {
            this.channels[channel] = [];
        }
    }
    part(chan) {
        let channel = chan.toLocaleLowerCase();
        if (this.channels[channel])
            delete this.channels[channel];
    }
    modeChanged(chan, modes) {
        for (var i in modes) {
            let mode = modes[i];
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
    }
    toString() {
        return "[ManagedUser " + this.display + "]";
    }
}
exports.ManagedUser = ManagedUser;
//# sourceMappingURL=ManagedUser.js.map