import { 
    CommandInteraction, 
    SlashCommandBuilder, 
} from "discord.js";
import fetch from "node-fetch";

interface cat {
    id: string,
    url: string,
    width: string,
    breeds: string,
    favorite: string,
} 

export const data = new SlashCommandBuilder()
    .setName("cats")
    .setDescription("Generates a cat picture!");
   

const url = "https://api.thecatapi.com/v1/images/search?limit=1";
export async function execute(interaction: CommandInteraction) {
    try {
        const res = await fetch(url);
        const data = await res.json() as cat[];

        // checks the joke type and uses the correct params based on that
        // check the api docs for more info (https://developers.thecatapi.com/view-account/ylX4blBYT9FaoVd6OhvR?report=bOoHBz-8t)
        const cat = data[0].url;
        await interaction.reply({ content: cat, ephemeral: false });

    } catch (err: any) {
        console.error(err.message);
    }
}
