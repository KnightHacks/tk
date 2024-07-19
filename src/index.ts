import { Client, WebhookClient } from "discord.js";
import { config } from "./config";
import { commands } from "./commands";
import { deployCommands } from "./deploy-commands";
import { hooks } from "./hooks";

/*
    Discord Bot Logic
*/

// Create a new discord bot client instance
export const client = new Client({
    intents: ["Guilds", "GuildMessages", "DirectMessages"],
});

// Log when T.K is ready
client.once("ready", () => {
    console.log("T.K is ready :)");
});

// Load commands when T.K joins a new guild
client.on("guildCreate", async (guild) => {
    await deployCommands({ guildId: guild.id });
});

// Load interactions
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) {
        return;
    }
    const { commandName } = interaction;
    if (commands[commandName as keyof typeof commands]) {
        commands[commandName as keyof typeof commands].execute(interaction);
    }
});

// Login to Discord
client.login(config.DISCORD_TOKEN);

/*
    Webhook Logic
*/

// Create a new Webhook client instance
const webhook = new WebhookClient({
    url: config.DISCORD_WEBHOOK_URL,
});

// Call all of the hooks
for (const hook of Object.values(hooks)) {
    hook(webhook);
}
