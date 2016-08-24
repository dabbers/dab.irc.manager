import * as Core from 'dab.irc.core/src';
export declare class ManagedUser extends Core.User {
    channels: {
        [key: string]: Core.Mode[];
    };
    join(chan: string): void;
    part(chan: string): void;
    modeChanged(chan: string, modes: Core.Mode[]): void;
    private removeMode(chan, mode);
    private addMode(chan, mode);
    findMode(chan: string, mode: Core.Mode): number;
}
