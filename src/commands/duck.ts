import { 
    CommandInteraction, 
    SlashCommandBuilder, 
    EmbedBuilder} from "discord.js";
import fetch from "node-fetch";
import JIMP from "jimp";

// DUCK COMMAND
// Command that posts duck images
interface DuckProps {
    message: string,
    url: string,
};

// Create the command
export const data = new SlashCommandBuilder()
    .setName("duck")
    .setDescription("Duck!");

const url = "https://random-d.uk/api/v2/quack";
export async function execute(interaction: CommandInteraction) {
    try {
        const res = await fetch(url);
        const data = await res.json() as DuckProps;

        const img = JIMP.read(data.url);
        const width = (await img).getWidth(), height = (await img).getHeight();
        const color = (await img).getPixelColor(width/2, height/2);

        const r = (color >> 24) & 0xFF;
        const g = (color >> 16) & 0xFF;
        const b = (color >> 8) & 0xFF;

        const hexString = `${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
        const embed = new EmbedBuilder().setImage(data.url).setColor(`#${hexString}`);
        interaction.reply({embeds: [embed]});
    } catch (err: any) {
        console.error(err.message);
    }
}