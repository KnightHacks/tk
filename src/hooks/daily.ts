import {
    WebhookClient,
    EmbedBuilder,
    ChannelType,
    ThreadAutoArchiveDuration,
} from "discord.js";
import { client } from "../index";
import fetch from "node-fetch";
import cron from "node-cron";

// Daily Problem Interface
interface DailyProblemProps {
    questionLink: string,
    questionTitle: string,
    difficulty: string,
    question: string,
    topicTags: Topic[],
    date: string,
    likes: number,
    dislikes: number,
    questionFrontendId: number,
    data: string,
}

// Topic Interfaces
interface Topic {
    name: string;
    slug: string;
}

const funMessages = [
    "Try not to TLE this time!",
    "Let's hope it's not a graph network flow DP problem...",
    "Don't use ChatGPT this time!",
    "👅",
    "May the bugs ever be in your favor!",
    "Don't use C for this one...",
    "Let's see who comes out victorious!",
    "Let's crack it together!",
    "Time to debug the day away!",
    "Today's challenge awaits!",
    "Let's code circles around Neetcode!",
    "Let's get to hacking!",
    "May your algorithms be swift and your bugs be minimal!",
    "Take a shower after this...",
    "Let's flex your brain muscles! 💪👅😈",
    "𝓛𝓮𝓽'𝓼 𝓬𝓸𝓭𝓮 𝓿𝓻𝓸 ❤️‍🔥⛓️👅",
    "I'm 𝓯𝓻𝓮𝓪𝓴𝔂 T.K! 🛡️👅"
];

// Leetcode API Endpoint and Channel ID
const url = "https://alfa-leetcode-api.onrender.com/daily";
// const channelId = "1263954540089180231";

// Function to fetch the Daily Problem
const fetchData = async (url: any): Promise<DailyProblemProps> => {
    try {
        const res = await fetch(url);

        if (!res.ok) {
            throw new Error(`Error: ${res.status}`);
        }

        const data = (await res.json()) as DailyProblemProps;
        return data;
    } catch (err) {
        console.log(`Error: ${err}`);
        throw err;
    }
};

const randInt = (max: number) => {
    return Math.floor(Math.random() * max);
};

// Leetcode Daily Problem Webhook
export async function execute(webhook: WebhookClient) {
    try {
        // Create a cron job that will run at 11:00 AM every day        
        cron.schedule("0 11 * * *", async () => {
            // Fetch the problem data and format the data
            const problem = await fetchData(url) as DailyProblemProps;
            const date = problem.date.split("-");            
            const dateString = date[1] + "/" + date[2] + "/" + date[0];
            
            // Create an embed message for aesthetics
            const problemEmbed = new EmbedBuilder()
            .setColor(0x33e0ff)
            .setTitle(
                `${problem.questionFrontendId}. ${problem.questionTitle}`
            )
            .setURL(problem.questionLink)
            .setAuthor({
                name: `Leetcode Daily for ${dateString}`, 
                iconURL: "https://assets.leetcode.com/static_assets/public/images/LeetCode_logo_rvs.png"
            })
            .addFields(
                {
                    name: "Difficulty", 
                    value: problem.difficulty, 
                    inline: true},
                {
                    name: "Likes", 
                    value: problem.likes.toString(), 
                    inline: true},
                {
                    name: "Dislikes", 
                    value: problem.dislikes.toString(), 
                    inline: true},
                {
                    name: "Topics", 
                    value:`${problem.topicTags
                    .map((top)=>{
                        return `${top.name}  -  *https://leetcode.com/tag/${top.slug}*`;})
                        .join("\n")}`}
            );
            
            //ROLE ID: 1264646263408693400; has to be hardcoded into the ping!
            const embed = await webhook.send({
                content: 
                "# Good Morning!\nHere's today's daily Leetcode problem! <@&1264646263408693400>\n"+
                funMessages[randInt(funMessages.length)], 
                embeds: [problemEmbed]
            }); // gives a little funny message with the announcement

            // We have 2 message types from 2 different packages
            // so we have to do this ..thing to convert it
            client.channels.fetch(embed.channel_id).then((channel) => {
                if (channel && channel.type === ChannelType.GuildText) {
                    channel.messages.fetch(embed.id).then(async (msg) => {
                        const thread = await msg.startThread({
                            name: dateString,
                            autoArchiveDuration:
                                ThreadAutoArchiveDuration.OneDay,
                        });

                        webhook.send({
                            content:
                                "Make sure to wrap your solution with spoiler tags!",
                            threadId: thread.id,
                        });
                    });
                }
            });
        });
    } catch (err: any) {
        console.error(err.message);
    } // any error
}
