import {Client, Events} from "discord.js";
import {IDiscordEvent} from "../core/types/IDiscordEvent.js";

export default class ReadyEvent implements IDiscordEvent<Events.ClientReady> {
    public readonly name = Events.ClientReady;

    public execute(client: Client) {
        console.log(`✅ Logged in as ${client.user?.tag}`);
    }
}