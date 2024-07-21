import {
    WebhookClient,
    EmbedBuilder,
    ChannelType,
    ThreadAutoArchiveDuration,
} from "discord.js";
import { client } from "../index";
import fetch from "node-fetch";
import cron from "node-cron";
import { config } from "../config";

export async function execute() {
    // Create a new Webhook client instance
    const webhook = new WebhookClient({
        url: config.DISCORD_WEBHOOK_URL,
    });

    try {
        // Check events on a schedule
        cron.schedule("0 11 * * *", async () => {
            console.log("freaky");
        });
    } catch (err: any) {
        console.error(err.message);
    } // any error
}
