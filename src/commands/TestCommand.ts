import {SlashCommandBuilder} from "discord.js";
import {CommandContext, IDiscordCommand} from "../core/types/IDiscordCommand.js";

export default class PingCommand implements IDiscordCommand {
    public readonly registration = "global";
    public readonly prefixEnabled = true;
    public readonly aliases = ['p', 'latency'];

    public readonly data = new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong! and shows the bot\'s latency.')

    public async execute(context: CommandContext): Promise<void> {
        const latency = context.client.ws.ping;
        const content = `Pong! 🏓 Latency is ${latency}ms.`;

        await context.reply(content);
    }
}