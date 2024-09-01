import { WebhookClient, EmbedBuilder } from "discord.js";
import fetch from "node-fetch";
import cron from "node-cron";
import { config } from "../config";
import he from "he";
import RRule from "rrule";

// Google Calendar Props Interface
interface GoogleCalendarProps {
    summary: string;
    items: GoogleCalendarDataProps[];
}

// Return Data Interface
interface GoogleCalendarDataProps {
    htmlLink: string;
    summary: string;
    description: string | null;
    location: string;
    start: TimeProps;
    end: TimeProps;
    recurrence: string[];
    status: string;
}

// Add field for mapping
interface Messages extends GoogleCalendarDataProps {
    range: "Today" | "Tomorrow" | "Next Week";
}

// Time Interface
interface TimeProps {
    date?: string;
    dateTime?: Date;
}

// Set as a date to test the same day function
// a string in the form "YYYY-MM-DD" can be passed to test a specific date
const TEST_DATE = undefined;

// Google maps API URL
const today = new Date(TEST_DATE ?? new Date().toLocaleDateString());
const nextWeek = new Date(today);
nextWeek.setDate(today.getDate() + 7);
const url = `https://www.googleapis.com/calendar/v3/calendars/${
    config.GOOGLE_CALENDAR_ID
}/events?key=${
    config.GOOGLE_API_KEY
}&timeMax=${nextWeek.toISOString()}&timeMin=${today.toISOString()}`;
console.log(url);

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
function isSameDay(date1: Date, date2: Date, event?: string): boolean {
    // Normalize dates to midnight UTC
    const normalizeDate = (date: Date) =>
        new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));

    const d1 = normalizeDate(date1);
    d1.setDate(d1.getDate() + 1);
    const d2 = normalizeDate(date2);

    const result = d1.getTime() === d2.getTime();

    console.log(
        `Date1: ${d1.toISOString()}`,
        `Date2: ${d2.toISOString()}`,
        `Event: ${event}`,
        `Are the same day? ${result}`
    );

    return result;
}

// remove html tags from a piece of text
// as the returned description from gcal api returns with tags
function removeHTMLTags(str: string) {
    if (str && typeof str === "string") {
        return str.replace(/(<([^>]+)>)/gi, "");
    } else {
        throw new TypeError(
            "The value passed to removeHTMLTags is not a string!"
        );
    }
}

// Date Interface
interface DateProps {
    start: string;
    end: string;
    date?: string;
}

// Grab the start and end date or time, depending if the event is multi or single day in duration
function getDateProps(
    date1: Date | string,
    date2: Date | string,
    event?: string
) {
    const dateObject: DateProps = {
        start: "",
        end: "",
        date: undefined,
    };

    // add one to month due to a bug that showed the previous month
    // if the root cause of this issue is found, you can take steps to fix it
    const newDate = new Date(date1);
    newDate.setHours(newDate.getHours());
    const month = (newDate.getMonth() + 1).toString();
    const day = newDate.getDate().toString();
    const year = newDate.getFullYear().toString();

    newDate.setDate(newDate.getDate() - 1);

    const newDate2 = new Date(date2);
    newDate2.setHours(newDate2.getHours());
    const month2 = (newDate2.getMonth() + 1).toString();
    const day2 = newDate2.getDate().toString();
    const year2 = newDate2.getFullYear().toString();

    console.log(event, newDate, newDate2);

    // Set start and end to times, and include the date
    if (
        isSameDay(newDate, newDate2, `${event} SAME DAY CHECK FOR DATE FORMAT`)
    ) {
        console.log("Same day event");
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

    // sets all consts to a new date with the local timezone.
    const today = new Date(TEST_DATE ?? new Date().toLocaleDateString());
    const tomorrow = new Date(today);
    const nextWeek = new Date(today);

    // offsets tomorrow and nextweek appropriately (you can do this to add days to a date)
    tomorrow.setDate(today.getDate() + 1);
    nextWeek.setDate(today.getDate() + 7);

    const validEvents: Messages[] = [];
    // filters out "cancelled" events from the initial data and objects that are recurring, and obj.recurrence is not null
    const allEvents = data.items
        .filter((event) => event.status !== "cancelled")
        .filter((event) => event.recurrence !== null)
        // remove elements with the same summary, keeping the greatest date
        // this is to prevent duplicate events from being displayed
        .reduce(
            (
                acc: GoogleCalendarDataProps[],
                event: GoogleCalendarDataProps
            ) => {
                const existingEvent = acc.find(
                    (e) => e.summary === event.summary
                );
                if (existingEvent) {
                    const existingDate = new Date(
                        existingEvent.start.dateTime ??
                            existingEvent.start.date ??
                            ""
                    );
                    const currentDate = new Date(
                        event.start.dateTime ?? event.start.date ?? ""
                    );
                    if (currentDate > existingDate) {
                        acc = acc.filter((e) => e.summary !== event.summary);
                        acc.push(event);
                    }
                } else {
                    acc.push(event);
                }
                return acc;
            },
            []
        );

    // Print all summaries and start dates
    allEvents.map((obj: GoogleCalendarDataProps) => {
        console.log(obj.summary, obj.start.dateTime);
    });

    // maps through the filtered events
    allEvents.map((obj: GoogleCalendarDataProps) => {
        // gets the event date based on two fields from the API
        // also sets this to local time zone
        const eventDate = new Date(
            new Date(
                obj.start.dateTime ?? obj.start.date ?? "TBA"
            ).toLocaleDateString()
        );

        console.log(today, tomorrow, nextWeek);
        if (isSameDay(today, eventDate, `${obj.summary} TODAY`)) {
            validEvents.push({
                ...obj,
                range: "Today",
            });
        } else if (isSameDay(tomorrow, eventDate, `${obj.summary} TOMORROW`)) {
            validEvents.push({
                ...obj,
                range: "Tomorrow",
            });
        } else if (isSameDay(nextWeek, eventDate, `${obj.summary} NEXT WEEK`)) {
            validEvents.push({
                ...obj,
                range: "Next Week",
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
        cron.schedule("0 12 * * *", async () => {
            console.log("Checking for events...");
            const events = await getValidEvents();

            if (events.length === 0) {
                return;
            } else if (events.length >= 1) {
                webhook.send(
                    `Hey everyone, here are some reminders about our upcoming events! <@&${config.CALENDAR_ROLE_ID}>\n`
                );
            }

            // Sort events by range, today -> tomorrow -> next week
            events.sort((a, b) => {
                if (a.range === "Today") {
                    return -1;
                } else if (a.range === "Tomorrow") {
                    return -1;
                } else {
                    return 1;
                }
            });

            events.map((event) => {
                const prefix = event.range;
                const date = getDateProps(
                    event.start.dateTime ?? event.start.date ?? "6/9/1969",
                    event.end.dateTime ?? event.end.date ?? "6/9/1969",
                    event.summary
                );

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
                        name: `${prefix}!`,
                        iconURL: "https://i.imgur.com/0BR5rSn.png",
                    })
                    .setDescription(
                        he.decode(
                            removeHTMLTags(event.description ?? "TBA") ?? "TBA"
                        )
                    )
                    .addFields(fields)

                    .setFooter({
                        text: "We hope to see you there! - the Knight Hacks Crew :)",
                    });

                // Send the message
                return webhook.send({
                    embeds: [eventEmbed],
                });
            });
        });
        // Catch any errors
    } catch (err: unknown) {
        // silences eslint. type safety with our errors basically
        err instanceof Error
            ? console.error(err.message)
            : console.error("An unknown error occurred: ", err);
    }
}
