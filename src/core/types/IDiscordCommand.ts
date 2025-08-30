import {
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    Message,
    PermissionResolvable,
    SlashCommandBuilder,
} from "discord.js";

export type CommandRegistrationType = "global" | "guild";
export type CommandContext = ChatInputCommandInteraction | Message;

export interface IDiscordCommand {
    registration: CommandRegistrationType;
    data: Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
    autocomplete?: (interaction: AutocompleteInteraction) => Promise<void>;

    prefixEnabled?: boolean;
    aliases?: string[];

    permissions?: PermissionResolvable[];
    cooldown?: number;
    execute: (context: CommandContext, args?: string[]) => Promise<void>;
}