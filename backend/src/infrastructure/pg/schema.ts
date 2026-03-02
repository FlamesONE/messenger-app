import { relations } from "drizzle-orm";
import {
	boolean,
	index,
	pgTable,
	primaryKey,
	text,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";

// ─── Users ──────────────────────────────────────────────

export const users = pgTable("users", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => nanoid()),
	email: varchar("email", { length: 255 }).notNull().unique(),
	username: varchar("username", { length: 64 }).notNull().unique(),
	displayName: varchar("display_name", { length: 128 }).notNull(),
	avatarUrl: text("avatar_url"),
	passwordHash: text("password_hash").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
	chatMembers: many(chatMembers),
	createdChats: many(chats),
}));

// ─── Chats ──────────────────────────────────────────────

export const chats = pgTable("chats", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => nanoid()),
	name: varchar("name", { length: 255 }),
	isGroup: boolean("is_group").default(false).notNull(),
	createdById: text("created_by_id")
		.notNull()
		.references(() => users.id),
	createdAt: timestamp("created_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
});

export const chatsRelations = relations(chats, ({ one, many }) => ({
	createdBy: one(users, {
		fields: [chats.createdById],
		references: [users.id],
	}),
	members: many(chatMembers),
}));

// ─── Chat Members ───────────────────────────────────────

export const chatMembers = pgTable(
	"chat_members",
	{
		chatId: text("chat_id")
			.notNull()
			.references(() => chats.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		role: varchar("role", { length: 16 }).notNull().default("member"),
		joinedAt: timestamp("joined_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		primaryKey({ columns: [table.chatId, table.userId] }),
		index("chat_members_user_idx").on(table.userId),
	],
);

export const chatMembersRelations = relations(chatMembers, ({ one }) => ({
	chat: one(chats, {
		fields: [chatMembers.chatId],
		references: [chats.id],
	}),
	user: one(users, {
		fields: [chatMembers.userId],
		references: [users.id],
	}),
}));
