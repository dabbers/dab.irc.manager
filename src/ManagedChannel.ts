import * as Core from 'dab.irc.core/src';
import * as Parser from 'dab.irc.parser/src';
import {ChannelManager} from './ChannelManager';
import {ManagedUser} from './ManagedUser';

export class ManagedChannel extends Core.Channel {
    get users() : { [key:string] : ManagedUser } {
        return this._manager.users.byChannelDictionary(this);
    }

    userList(fncSort: (a:ManagedUser, b:ManagedUser) => number = undefined) : ManagedUser[] {
        return this._manager.users.byChannelArray(this).sort(fncSort);
    }
    
    get modes() : Core.Mode[] {
        return this._modes;
    }

    get bans() : Core.Mode[] {
        return this._modes.filter( (v, i, a) => v.character == 'b' );
    }
    get invites() : Core.Mode[] {
        return this._modes.filter( (v, i, a) => v.character == 'I' );
    }
    get excepts() : Core.Mode[] {
        return this._modes.filter( (v, i, a) => v.character == 'e' );
    }

    get references() : number {
        return this._references;
    }

    constructor(display:string, manager : ChannelManager, tolower:boolean = true) {
        super(display, tolower);
        this._manager = manager;
        this.joinMe();
    }

    // When a channel owner joins the channel
    joinMe() {
        this._references++;
    }

    // When you part this channel. Returns true if has no owners in it
    // returns false if there is at least 1 reference in this channel.
    partMe() : boolean {
        this._references--;
        
        return this._references <= 0;
    }

    modeChanged(modes: Core.Mode[]) {
        for(var i in modes) {
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

    private _users : Core.User[];
    private _modes : Core.Mode[];
    private _manager : ChannelManager;
    private _references : number = 0;
}