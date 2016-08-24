import * as Core from 'dab.irc.core/src';
import {ManagedUser} from './ManagedUser';

export class ManagedChannelUser extends ManagedUser {

    constructor(usr: ManagedUser, chan:string) {
        super(usr.nick, usr.ident, usr.host);

        this.channels = usr.channels;
        this.channel = chan;
    }
    
    get modes() : Core.Mode[] {
        return this.channels[this.channel];
    }

    private channel : string;

}