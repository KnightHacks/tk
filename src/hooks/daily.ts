import { WebhookClient } from "discord.js";

// Leetcode Daily Problem Webhook
export async function execute(webhook: WebhookClient) {
    // Send a hello world message every 10 seconds
    setInterval(() => {
        webhook.send("I LOVE LEETCODE!");
    }, 10000);
}
