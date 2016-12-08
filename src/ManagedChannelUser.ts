import * as Core from 'dab.irc.core/src';
import {ManagedUser} from './ManagedUser';

export class ManagedChannelUser extends ManagedUser {

    constructor(usr: ManagedUser, chan:string) {
        super(usr.nick, usr.ident, usr.host);

        this.channels = usr.channels || {};
        this.channel = chan;
    }
    
    get modes() : Core.Mode[] {
        // DevNote: Should we just associate the Mode[] ref instead of storing channel string? Is this lookup 
        // possibly bad for perf? Is there a situation where the channels object might update its array object? (huh?)
        // I think lookup perf shouldn't be an issue. A user will be in < 75 channels on average.
        return this.channels[this.channel];
    }
    set modes(v:Core.Mode[]) {
        if (!this.channel) return;
        this.channels[this.channel] = v;
    }

    private channel : string;
}