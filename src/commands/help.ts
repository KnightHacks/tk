import { CommandInteraction, SlashCommandBuilder } from "discord.js";

// HELP COMMAND
// Command to help users with the bot

// Create the command
export const data = new SlashCommandBuilder()
    .setName("help")
    .setDescription("Replies with a list of commands!");

// Logic for the help command
export async function execute(interaction: CommandInteraction) {
    // Create the embedding
    const embed = {
        title: "Commands",
        description: "Here is a list of commands you can use with the bot!",
        color: 0x33e0ff,
        fields: [
            {
                name: "/countdown",
                value: "Shows the countdown until Knight Hacks VII",
            },
            {
                name: "/sign_in",
                value: "Signs you in to an event!",
            },
            {
                name: "/check_points",
                value: "Checks your Knight Hacks points!",
            },
            {
                name: "/leaderboard",
                value: "Shows the leaderboard privately",
            },
            {
                name: "/flex",
                value: "Flexes your points on someone!",
            },
            {
                name: "/flowchart",
                value: "Sends the flowchart for CS, IT, and CE!",
            },
            {
                name: "/joke",
                value: "Tells a random joke!",
            },
            {
                name: "/beep",
                value: "Boop!",
            },
            {
                name: "/duck",
                value: "Quack!",
            },
            {
                name: "/cat",
                value: "Sends a random cat image!",
            },
            {
                name: "/help",
                value: "Shows this list of helpful commands!",
            },
        ],
    };

    // Send the embedding
    await interaction.reply({ embeds: [embed] });
}