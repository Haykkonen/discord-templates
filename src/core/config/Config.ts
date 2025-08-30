import "dotenv/config";
import * as z from "zod";

const configSchema = z.object({
    DISCORD_TOKEN: z.string().min(1, "DISCORD_TOKEN is missing or empty in the .env file."),
    CLIENT_ID: z.string().min(1, "CLIENT_ID is missing or empty in the .env file."),
    PREFIX: z.string().min(1, "PREFIX is missing or empty in the .env file."),

    GUILD_ID: z.string().optional(),

});
const parsedConfig = configSchema.safeParse(process.env);

if (!parsedConfig.success) {
    console.error("❌ Invalid environment variables:", parsedConfig.error);
    throw new Error("Invalid environment variables.");
}

export const config = parsedConfig.data;
