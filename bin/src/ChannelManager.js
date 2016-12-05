"use strict";
const Core = require('dab.irc.core/src');
const Parser = require('dab.irc.parser/src');
const UserManager_1 = require('./UserManager');
const ManagedChannel_1 = require('./ManagedChannel');
class ChannelManager {
    constructor(userManager = new UserManager_1.UserManager()) {
        this._channels = [];
        this._channelsProxy = new Proxy({}, {
            get: (proxy, name) => {
                return this._channels.filter((c) => c.display.toLocaleLowerCase() == name.toString().toLocaleLowerCase())[0];
            }
        });
        this._users = userManager;
    }
    get users() {
        return this._users;
    }
    get channels() {
        return this._channels;
    }
    get channel() {
        return this._channelsProxy;
    }
    register(server) {
        server.on(Parser.Events.JOIN, this.bindJoin.bind(this));
        server.on(Parser.Events.PART, this.bindPart.bind(this));
        server.on(Parser.Events.MODE, this.bindMode.bind(this));
        server.on(Parser.Numerics.NAMREPLY, this.bindNames.bind(this));
    }
    unregister(server) {
        server.removeListener(Parser.Events.JOIN, this.bindJoin);
        server.removeListener(Parser.Events.PART, this.bindJoin);
        server.removeListener(Parser.Events.MODE, this.bindMode);
        server.removeListener(Parser.Numerics.NAMREPLY, this.bindNames);
    }
    join(channel) {
        if (this._channels.filter((v, id, ar) => v.display.toLocaleLowerCase() == channel.display.toLocaleLowerCase()).length > 0) {
            return false;
        }
        if (channel instanceof ManagedChannel_1.ManagedChannel) {
            this._channels.push(channel);
        }
        else {
            this._channels.push(new ManagedChannel_1.ManagedChannel(channel.display, this));
        }
        return true;
    }
    bindNickChange(s, m) {
        let msg = m;
        this._users.rename(msg.from.nick, msg.destination.nick);
    }
    bindJoin(s, m) {
        let msg = m;
        this._users.join(msg, msg.destination);
    }
    bindPart(s, m) {
        let msg = m;
        this._users.part(msg, msg.destination);
    }
    bindMode(s, m) {
        let msg = m;
        if (msg.destination instanceof Core.Channel) {
            let ch = this._channels.filter((v, i, a) => v.display.toLocaleLowerCase() == s.display.toLocaleLowerCase());
            if (ch.length > 0) {
                ch[0].modeChanged(msg.modes);
            }
        }
    }
    bindNames(s, m) {
        let msg = m;
        for (let i in msg.users) {
            this._users.nameAdd(msg.users[i], msg.destination);
        }
    }
    part(channel) {
        let i = 0;
        for (i in this._channels) {
            if (this._channels[i].display == channel.display) {
                break;
            }
        }
        let res = this._channels[i].partMe();
        if (res) {
            this._channels.splice(i, 1);
        }
    }
}
exports.ChannelManager = ChannelManager;
//# sourceMappingURL=ChannelManager.js.map