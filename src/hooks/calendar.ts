import {
    WebhookClient,
    EmbedBuilder,
    ChannelType,
    ThreadAutoArchiveDuration,
} from "discord.js";
import { client } from "../index";
import fetch from "node-fetch";
import cron from "node-cron";

export async function execute(webhook: WebhookClient) {
    try {
        // Check events on a schedule        
        cron.schedule("0 11 * * *", async () => {
            console.log("freaky")
    })} catch (err: any) {
        console.error(err.message);
    } // any error
}
