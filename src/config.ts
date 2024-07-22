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
    DATABASE_URL,
    DATABASE_AUTH_TOKEN,
} = process.env;

// Check if the environment variables are set
if (
    !DISCORD_TOKEN ||
    !DISCORD_CLIENT_ID ||
    !DISCORD_WEBHOOK_URL ||
    !DAILY_WEBHOOK_URL ||
    !DAILY_ROLE_ID ||
    !DATABASE_URL ||
    !DATABASE_AUTH_TOKEN
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
    DATABASE_URL,
    DATABASE_AUTH_TOKEN,
};
