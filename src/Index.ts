import {Client, GatewayIntentBits} from "discord.js";
import {config} from "./core/config/Config.js";
import {registerEvents} from "./core/handlers/EventHandler.js";
import ReadyEvent from "./events/Ready.js";
import {registerCommands} from "./core/handlers/CommandHandler.js";
import PingCommand from "./commands/TestCommand.js";

const client = new Client({
    intents: Object.keys(GatewayIntentBits).map((a: string) => {
        return GatewayIntentBits[a as keyof typeof GatewayIntentBits];
    })
});

async function main() {
    registerEvents(client, new ReadyEvent());

    await registerCommands(client, new PingCommand());

    await client.login(config.DISCORD_TOKEN);
}

main().catch()
