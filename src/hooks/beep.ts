import { WebhookClient } from "discord.js";

// Test webhook command
export async function execute(webhook: WebhookClient) {
    // Send a hello world message every 10 seconds
    setInterval(() => {
        webhook.send("Beep Boop!");
    }, 10000);
}
