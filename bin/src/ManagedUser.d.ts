import * as Core from 'dab.irc.core/src';
export declare class ManagedUser extends Core.User {
    channels: {
        [key: string]: Core.Mode[];
    };
    joinChan(chan: string): void;
    partChan(chan: string): void;
    modeChanged(chan: string, modes: Core.Mode[]): void;
    toString(): string;
}
