import {
    CommandInteraction,
    SlashCommandBuilder,
    EmbedBuilder,
    GuildMemberRoleManager,
    RoleResolvable,
} from "discord.js";
import db from "../db/db";
import { asc, eq } from "drizzle-orm";
import { eventUsers, groups, hackers } from "../db/schema";
// SIGN IN EVENT COMMAND
// Command to sign into an event

// Create the command
export const data = new SlashCommandBuilder()
    .setName("check_in")
    .setDescription("Embark on an adventure!");

export async function execute(interaction: CommandInteraction) {
    const username = interaction.user.username;
    console.log(username);
    console.log(username == "dvidal1205");

    // Grabs data from db with sign-up form data to check for discord username
    const userProfileData = await db.query.userProfiles.findFirst({
        where: (table, { eq }) => eq(table.discord, username),
    });

    if (userProfileData == null) {
        console.log("User Profile Missing");
        return interaction.reply({
            content: "User not found! Please visit table for assistance!",
            ephemeral: true,
        });
    }

    // Uses userID from the userProfile to get a "hacker" from the hacker table
    const hacker = await db.query.hackers.findFirst({
        where: (table, { eq }) => eq(table.userID, userProfileData.userID),
    });

    if (!hacker) {
        console.log("Hacker Profile Missing");
        return interaction.reply({
            content: "User not found! Please visit table for assistance!",
            ephemeral: true,
        });
    }

    // Check if checked in
    if (hacker.status == "checkedin") {
        return interaction.reply({
            content:
                "You are already checked in! To get a new badge, run /badge! Have fun!",
            ephemeral: true,
        });
    }

    // checks if a hacker has been accepted
    if (hacker.status != "accepted")
        return interaction.reply({
            content:
                "You have not been accepted! Please visit table for assistance!",
            ephemeral: true,
        });

    const user = await db.query.users.findFirst({
        where: (table, { eq }) => eq(table.id, userProfileData.id),
    });

    // Find the group with the least number_of_users
    const eventGroups = await db
        .select()
        .from(groups)
        .orderBy(asc(groups.number_of_users));
    const minGroup = eventGroups[0];

    // Instantiate the event user
    await db.insert(eventUsers).values({
        id: userProfileData.userID,
        group_id: minGroup.id,
        discord_id: interaction.user.id,
        username: userProfileData.discord,
        points: 0,
        num_attended: 0,
    });

    // Update the group's number_of_users
    await db
        .update(groups)
        .set({ number_of_users: eventGroups[0].number_of_users + 1 })
        .where(eq(groups.id, minGroup.id));

    // Update the hacker status to checked in
    await db
        .update(hackers)
        .set({ status: "checkedin" })
        .where(eq(hackers.userID, hacker.userID));

    // Add the corresponding role to the hacker
    const guild = interaction.guild;
    const role = guild?.roles.cache.find(
        (role) => role.id === minGroup.role_id
    ) as RoleResolvable;
    const member = interaction.member;
    const memberRoles = member?.roles as GuildMemberRoleManager;
    await memberRoles.add(role);

    const groupName =
        minGroup.name.charAt(0).toUpperCase() + minGroup.name.slice(1);
    const embed = new EmbedBuilder()
        .setTitle(
            `Welcome, **${user?.firstName} ${user?.lastName}**!`
        )
        .setImage(minGroup.image)
        .setDescription(`You're a part of the ${groupName} Crew!`)
        .setFooter({
            text: "Run /badge to resend this message if you lose it!",
        })
        .setColor(0xdbc34c);
    // Respond with a success status
    // TODO: ping group role!
    return interaction.reply({ embeds: [embed], ephemeral: true });
}
