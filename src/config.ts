import dotenv from "dotenv";

// Access the environment variables
dotenv.config();

// Get the environment variables
const {
    DISCORD_TOKEN,
    DISCORD_CLIENT_ID,
    DISCORD_WEBHOOK_URL,
    DAILY_WEBHOOK_URL,
    DAILY_ROLE_ID,
} = process.env;

// Check if the environment variables are set
if (
    !DISCORD_TOKEN ||
    !DISCORD_CLIENT_ID ||
    !DISCORD_WEBHOOK_URL ||
    !DAILY_WEBHOOK_URL ||
    !DAILY_ROLE_ID
) {
    throw new Error("Missing environment variables");
}

// Export the config object
export const config = {
    DISCORD_TOKEN,
    DISCORD_CLIENT_ID,
    DISCORD_WEBHOOK_URL,
    DAILY_WEBHOOK_URL,
    DAILY_ROLE_ID,
};
