import {
    WebhookClient,
    EmbedBuilder
} from "discord.js";
import fetch from "node-fetch";
import cron from "node-cron";
import { config } from "../config";
import JIMP from "jimp";

interface CatProps {
    url: string,
} 

const url = "https://api.thecatapi.com/v1/images/search?limit=1";

const fetchCatImage = async (url: any) => {
    try {
        const res = await fetch(url);

        if(!res.ok) {
            throw new Error(`Error: ${res.status}`);
        }

        const data = (await res.json()) as CatProps[];
        return data;
    } catch (err) {
        console.log(`Error" ${err}`);
        throw err;
    }
}

export async function execute() {
    const webhook = new WebhookClient({
        url: config.CAT_WEBHOOK_URL,
    });

    try {
        cron.schedule("0 13 * * *", async () => {
            const catImageData = await fetchCatImage(url);

            const img = JIMP.read(catImageData[0].url);
            const width = (await img).getWidth(),
                height = (await img).getHeight();
            const color = (await img).getPixelColor(width / 2, height / 2);

            const r = (color >> 24) & 0xff;
            const g = (color >> 16) & 0xff;
            const b = (color >> 8) & 0xff;

            const hexString = `${((1 << 24) + (r << 16) + (g << 8) + b)
                .toString(16)
                .slice(1)
                .toUpperCase()}`;
            const catEmbed = new EmbedBuilder()
                .setTitle("Daily Cat!")
                .setImage(catImageData[0].url)
                .setColor(`#${hexString}`);

            
            return webhook.send({
                embeds: [catEmbed]
            });
        });
    } catch (err: any) {
        console.error(err.message);
    }
}

