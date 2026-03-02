import { t } from "elysia";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { users, chats, chatMembers } from "./schema";
import { spreads } from "./utils";

export const db = {
	insert: spreads(
		{
			user: createInsertSchema(users, {
				email: t.String({ format: "email" }),
			}),
			chat: chats,
			chatMember: chatMembers,
		},
		"insert",
	),
	select: spreads(
		{
			user: createSelectSchema(users, {
				email: t.String({ format: "email" }),
			}),
			chat: chats,
			chatMember: chatMembers,
		},
		"select",
	),
} as const;
