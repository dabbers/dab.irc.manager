import * as Core from 'dab.irc.core/src';

export class ManagedUser extends Core.User {
    channels : {[key:string]  : Core.Mode[] } = {};


    join(chan: string) {
        let channel = chan.toLocaleLowerCase();
        
        if (this.channels[chan]) {
            // Channel already exists
            return;
        }

        this.channels[channel] = [];;
    }

    part(chan: string) {
        let channel = chan.toLocaleLowerCase();
        
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
}