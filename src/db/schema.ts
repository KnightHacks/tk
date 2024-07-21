import { relations, sql } from "drizzle-orm";
import {
    text,
    integer,
    sqliteTable,
    primaryKey,
} from "drizzle-orm/sqlite-core";

// Events table
export const events = sqliteTable("events", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    password: text("password").notNull(),
    point_value: integer("point_value").notNull(),
    num_attended: integer("num_attended").notNull().default(0),
});

// One event can have many users that have attended
export const eventsRelations = relations(events, ({ many }) => ({
    usersToEvents: many(usersToEvents),
}));

// Users table
export const users = sqliteTable("users", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    discord_id: text("discord_id").notNull(),
    username: text("username").notNull(),
    points: integer("points").notNull().default(0),
    num_attended: integer("num_attended").notNull().default(1),
});

// One user can attend many events
export const usersRelations = relations(users, ({ many }) => ({
    usersToEvents: many(usersToEvents),
}));

export const usersToEvents = sqliteTable(
    "users_to_events",
    {
        user_id: integer("user_id")
            .notNull()
            .references(() => users.id),
        event_id: integer("event_id")
            .notNull()
            .references(() => events.id),
    },
    (t) => ({
        pk: primaryKey({ columns: [t.user_id, t.event_id] }),
    })
);

export const usersToEventsRelations = relations(usersToEvents, ({ one }) => ({
    event: one(events, {
        fields: [usersToEvents.event_id],
        references: [events.id],
    }),
    user: one(users, {
        fields: [usersToEvents.user_id],
        references: [users.id],
    }),
}));
