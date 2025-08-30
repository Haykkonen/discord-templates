import {Client, Collection, Events, Interaction, Message, PermissionsBitField, REST, Routes} from "discord.js";
import {IDiscordCommand} from "../types/IDiscordCommand.js";
import {config} from "../config/Config.js";
import {IDiscordEvent} from "../types/IDiscordEvent.js";
import {registerEvents} from "./EventHandler.js";

declare module "discord.js" {
    export interface Client {
        commands: Collection<string, IDiscordCommand>;
        aliases: Collection<string, string>;
        cooldowns: Collection<string, Collection<string, number>>;
    }
}

export class InteractionCreateEvent implements IDiscordEvent<Events.InteractionCreate> {
    readonly name = Events.InteractionCreate;

    async execute(interaction: Interaction): Promise<void> {
        if (!interaction.isChatInputCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);
        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        if (command.permissions && command.permissions.length > 0) {
            const memberPermissions = interaction.member?.permissions as PermissionsBitField;
            if (!memberPermissions?.has(command.permissions)) {
                await interaction.reply({content: 'You do not have permission to use this command.', ephemeral: true});
                return;
            }
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(`Error executing ${interaction.commandName}`, error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({content: 'There was an error while executing this command!', ephemeral: true});
            } else {
                await interaction.reply({content: 'There was an error while executing this command!', ephemeral: true});
            }
        }
    }
}

export class MessageCreateEvent implements IDiscordEvent<Events.MessageCreate> {
    readonly name = Events.MessageCreate;

    async execute(message: Message): Promise<void> {
        if (message.author.bot || !message.guild) return;
        if (!message.content.startsWith(config.PREFIX)) return;

        const args = message.content.slice(config.PREFIX.length).trim().split(/ +/);
        const commandName = args.shift()!.toLowerCase();

        const command = message.client.commands.get(commandName) ||
            message.client.commands.get(message.client.aliases.get(commandName)!);

        if (!command?.prefixEnabled) return;

        if (command.permissions && command.permissions.length > 0) {
            if (!message.member?.permissions.has(command.permissions)) {
                await message.reply('You do not have permission to use this command.');
                return;
            }
        }

        try {
            await command.execute(message, args);
        } catch (error) {
            console.error(`Error executing prefix command ${commandName}`, error);
            await message.reply('There was an error while executing this command!');
        }
    }
}

export async function registerCommands(client: Client, ...commands: IDiscordCommand[]): Promise<void> {
    registerEvents(client, new InteractionCreateEvent(), new MessageCreateEvent());

    client.commands = new Collection();
    client.aliases = new Collection();
    client.cooldowns = new Collection();

    const guildCommands: any[] = [];
    const globalCommands: any[] = [];

    for (const command of commands) {
        const commandName = command.data.name;
        client.commands.set(commandName, command);
        console.log(`Command ${commandName} loaded.`);

        if (command.prefixEnabled && command.aliases) {
            for (const alias of command.aliases) client.aliases.set(alias, commandName);
        }

        if (command.registration === "global") {
            globalCommands.push(command.data.toJSON());
        } else {
            guildCommands.push(command.data.toJSON());
        }
    }

    const rest = new REST().setToken(config.DISCORD_TOKEN);

    try {
        console.log("Started refreshing application (/) commands.");

        if (guildCommands.length > 0 && config.GUILD_ID) {
            await rest.put(Routes.applicationGuildCommands(config.CLIENT_ID, config.GUILD_ID), {body: guildCommands},);
            console.log(`Successfully reloaded ${guildCommands.length} guild (/) commands for guild ${config.GUILD_ID}.`,);
        }

        if (globalCommands.length > 0) {
            await rest.put(Routes.applicationCommands(config.CLIENT_ID), {body: globalCommands,});
            console.log(`Successfully reloaded ${globalCommands.length} global (/) commands.`,);
        }
    } catch (error) {
        console.error("Error refreshing application (/) commands:", error);
    }
}
