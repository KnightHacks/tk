import {
    WebhookClient,
    EmbedBuilder,
} from "discord.js";
import fetch from "node-fetch";
import cron from "node-cron";
import { config } from "../config";
import he from "he";

// Google Calendar Props Interface
interface GoogleCalendarProps {
    summary: string,
    items: GoogleCalendarDataProps[],
}

// Return Data Interface
interface GoogleCalendarDataProps {
    htmlLink: string,
    summary: string,
    description: string | null,
    location: string,
    start: TimeProps,
    end: TimeProps
}

// Add field for mapping
interface Messages extends GoogleCalendarDataProps {
    range: "Today" | "Tomorrow" | "Next Week"
}

// Time Interface
interface TimeProps {
    date?: string,
    dateTime?: Date,
}

// Google maps API URL
const url = 
`https://www.googleapis.com/calendar/v3/calendars/${config.GOOGLE_CALENDAR_ID}/events?key=${config.GOOGLE_API_KEY}`;


// Function to fetch all of the events
const fetchEvents = async (url: string) => {
    try {
        const res = await fetch(url);

        if (!res.ok) {
            throw new Error(`Error: ${res.status}`);
        }

        const data = (await res.json()) as GoogleCalendarProps;
        return data;
    } catch (err) {
        console.log(`Error: ${err}`);
        throw err;
    }
};

// Check if two dates are the same day
function isSameDay(date1: Date, date2: Date): boolean {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
}

// Date Interface
interface DateProps {
    start: string;
    end: string;
    date?: string;
}

// Grab the start and end date or time, depending if the event is multi or single day in duration
function getDateProps(date1: Date | string, date2: Date | string) {
    const dateObject: DateProps = {
        start: "",
        end: "",
        date: undefined
    };


    const newDate = new Date(date1);
    const month = newDate.getMonth().toString();
    const day = (newDate.getDate() + 1).toString();
    const year = newDate.getFullYear().toString();

    const newDate2 = new Date(date2);
    const month2 = newDate2.getMonth().toString();
    const day2 = newDate2.getDate().toString();
    const year2 = newDate2.getFullYear().toString();

    // Set start and end to times, and include the date
    if (isSameDay(newDate, newDate2)) {
        const hours1 = newDate.getHours();
        const minutes1 = newDate.getMinutes().toString().padStart(2, "0");
        const hours2 = newDate2.getHours();
        const minutes2 = newDate2.getMinutes().toString().padStart(2, "0");

        const period1 = hours1 >= 12 ? "PM" : "AM";
        const period2 = hours2 >= 12 ? "PM" : "AM";

        const formattedHours1 = (hours1 % 12 || 12).toString();
        const formattedHours2 = (hours2 % 12 || 12).toString();

        dateObject.start = formattedHours1 + ":" + minutes1 + " " + period1;
        dateObject.end = formattedHours2 + ":" + minutes2 + " " + period2;
        dateObject.date = month + "/" + day + "/" + year;
    } else {

        // Set start and end to dates
        dateObject.start = month + "/" + day + "/" + year;
        dateObject.end = month2 + "/" + day2 + "/" + year2;
    }

    return dateObject;
}

// Grab all events that are today, tomorrow, or in a week
async function getValidEvents() {
    const data = await fetchEvents(url);

    const today = new Date();
    const tomorrow = new Date();
    const nextWeek = new Date();
    tomorrow.setDate(today.getDate() + 1);
    nextWeek.setDate(today.getDate() + 7);
    const validEvents: Messages[]= [];

    data.items.map((obj) => {
        const eventDate = new Date(obj.start.dateTime ?? obj.start.date ?? "TBA");
        if (isSameDay(today, eventDate)) {
            validEvents.push({
                ...obj,
                range: "Today"
            });
        }
        else if (isSameDay(tomorrow, eventDate)) {

            validEvents.push({
                ...obj,
                range: "Tomorrow"
            });
        }
        else if (isSameDay(nextWeek, eventDate)) {
            validEvents.push({
                ...obj,
                range: "Next Week"
            });
        }
    });

    return validEvents;
}

export async function execute() {
    // Create a new Webhook client instance
    const webhook = new WebhookClient({
        url: config.CALENDAR_WEBHOOK_URL,
    });


    try {
        // Check events on a schedule
        cron.schedule("0 16 * * *", async () => {

            const events = await getValidEvents();

            if (events.length === 0){
                return;
            } else if (events.length >= 1) {
                webhook.send(`Hey everyone, here are some reminders about our upcoming events! <@&${config.CALENDAR_ROLE_ID}>\n`);
            }

            events.map((event) => {
                const prefix = event.range;
                const date = getDateProps(
                    event.start.dateTime 
                    ?? event.start.date ?? 
                    "6/9/1969", 
                    event.end.dateTime 
                    ?? event.end.date ?? 
                    "6/9/1969");
                
                // Conditionally render the fields based off the date
                const fields = [
                    {
                        name: "Location",
                        value: event.location ?? "TBA",
                        inline: date ? true : false,
                    },
                    {
                        name: "Start",
                        value: `${date.start}`,
                        inline: true,
                    },
                    {
                        name: "End",
                        value: `${date.end}`,
                        inline: true,
                    },
                ];

                if (date.date) {
                    fields.splice(1, 0, {
                        name: "Date",
                        value: `${date.date}`,
                        inline: false,
                    });
                }

                // Create the embed
                const eventEmbed = new EmbedBuilder()
                    .setColor(0x33e0ff)
                    .setTitle(event.summary)
                    .setURL(event.htmlLink)
                    .setAuthor({
                        name: `Theres a new event ${prefix}!`,
                        iconURL: "https://i.imgur.com/0BR5rSn.png"
                    })
                    .setDescription(he.decode(event.description ?? "TBA"))
                    .addFields(fields)
                    
                    .setFooter({
                        text: "We hope to see you there! - the Knight Hacks Crew :)"
                    });
                    
                    // Send the message
                    return webhook.send({
                        embeds: [eventEmbed]
                    }); 
            });
        });
    // Catch any errors
    } catch (err: unknown) {
        // silences eslint. type safety with our errors basically
        err instanceof Error ? 
            console.error(err.message) : 
            console.error("An unknown error occurred: ", err);
    }
}
