import { and, eq } from "drizzle-orm";
import type {
	ChatMemberRecord,
	ChatRecord,
	CreateChatData,
	IChatRepository,
} from "@/repositories/interfaces/chat.repository";
import { db } from "./pg.client";
import { chatMembers, chats } from "./schema";

export class PgChatRepository implements IChatRepository {
	async findById(id: string): Promise<ChatRecord | null> {
		const [chat] = await db
			.select()
			.from(chats)
			.where(eq(chats.id, id))
			.limit(1);
		return chat ?? null;
	}

	async findByUserId(userId: string): Promise<ChatRecord[]> {
		const memberRows = await db
			.select({ chatId: chatMembers.chatId })
			.from(chatMembers)
			.where(eq(chatMembers.userId, userId));

		if (memberRows.length === 0) return [];

		const results: ChatRecord[] = [];
		for (const row of memberRows) {
			const chat = await this.findById(row.chatId);
			if (chat) results.push(chat);
		}
		return results;
	}

	async create(data: CreateChatData): Promise<ChatRecord> {
		const [chat] = await db
			.insert(chats)
			.values({
				name: data.name,
				isGroup: data.isGroup,
				createdById: data.createdById,
			})
			.returning();

		const memberValues = data.memberIds.map((userId) => ({
			chatId: chat.id,
			userId,
			role: userId === data.createdById ? "owner" : "member",
		}));

		if (memberValues.length > 0) {
			await db.insert(chatMembers).values(memberValues);
		}

		return chat;
	}

	async addMember(
		chatId: string,
		userId: string,
		role: "admin" | "member" = "member",
	): Promise<void> {
		await db
			.insert(chatMembers)
			.values({ chatId, userId, role })
			.onConflictDoNothing();
	}

	async removeMember(chatId: string, userId: string): Promise<void> {
		await db
			.delete(chatMembers)
			.where(
				and(eq(chatMembers.chatId, chatId), eq(chatMembers.userId, userId)),
			);
	}

	async getMembers(chatId: string): Promise<ChatMemberRecord[]> {
		return db.select().from(chatMembers).where(eq(chatMembers.chatId, chatId));
	}

	async isMember(chatId: string, userId: string): Promise<boolean> {
		const [row] = await db
			.select()
			.from(chatMembers)
			.where(
				and(eq(chatMembers.chatId, chatId), eq(chatMembers.userId, userId)),
			)
			.limit(1);
		return !!row;
	}
}
