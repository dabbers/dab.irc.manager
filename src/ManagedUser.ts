import * as Core from 'dab.irc.core/src';

export class ManagedUser extends Core.User {
    channels : {[key:string]  : Core.Mode[] } = {};


    joinChan(chan: string) {
        let channel = chan.toLocaleLowerCase();
        
        // We depend on this check in UserManager
        if (this.channels[chan] === undefined) {
            // Channel doesn't exist yet
            this.channels[channel] = [];
        }
    }

    partChan(chan: string) {
        let channel = chan.toLocaleLowerCase();
        
        // We depend on this check in UserManager
        if (this.channels[channel])
            delete this.channels[channel];
    }

    modeChanged(chan:string, modes: Core.Mode[]) {
        for(var i in modes) {
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

    
    toString():string {
        return "[ManagedUser " + this.display + "]";
    }
}