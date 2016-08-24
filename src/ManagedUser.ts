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
    }

    private removeMode(chan:string, mode: Core.Mode) {
        let ind = this.findMode(chan, mode);
        if (ind != -1) {
            this.channels[chan].splice(ind, 1);
        }
    }

    private addMode(chan:string, mode: Core.Mode) {
        if (this.findMode(chan, mode) == -1) {
            this.channels[chan].push(mode);
        }
    }

    // Finds the mode character and argument if it exists. Returns the index for it. -1 if not found.
    findMode(chan:string, mode: Core.Mode) : number {
        let index = -1;
        let res = this.channels[chan].filter( (v, i, a) => {
            if (v.character == mode.character && v.argument == mode.argument) {
                index = i;
                return true;
            }
            return false;
        });

        return (res.length > 0) ? index : -1;
    }
}