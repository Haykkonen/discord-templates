import {ClientEvents} from "discord.js";

export interface IDiscordEvent<E extends keyof ClientEvents> {
    readonly name: E;
    readonly once?: boolean;
    readonly priority?: number;
    execute: (...args: ClientEvents[E]) => void | Promise<void>;
}