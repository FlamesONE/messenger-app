import { and, eq, inArray } from "drizzle-orm";
import type {
	ChatMemberRecord,
	ChatRecord,
	CreateChatData,
	IChatRepository,
} from "@/repositories/interfaces/chat.repository";
import { db } from "@/infrastructure/pg/client";
import { chatMembers, chats } from "@/infrastructure/pg/schema";

export class PgChatRepository implements IChatRepository {
	async findById(id: string): Promise<ChatRecord | null> {
		const row = await db.query.chats.findFirst({
			where: eq(chats.id, id),
		});
		return row ?? null;
	}

	async findByUserId(userId: string): Promise<ChatRecord[]> {
		const memberRows = await db
			.select({ chatId: chatMembers.chatId })
			.from(chatMembers)
			.where(eq(chatMembers.userId, userId));

		if (memberRows.length === 0) return [];

		const chatIds = memberRows.map((r) => r.chatId);
		return db.select().from(chats).where(inArray(chats.id, chatIds));
	}

	async create(data: CreateChatData): Promise<ChatRecord> {
		return db.transaction(async (tx) => {
			const [chat] = await tx
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
				await tx.insert(chatMembers).values(memberValues);
			}

			return chat;
		});
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
		const rows = await db
			.select()
			.from(chatMembers)
			.where(eq(chatMembers.chatId, chatId));
		return rows as ChatMemberRecord[];
	}

	async isMember(chatId: string, userId: string): Promise<boolean> {
		const row = await db.query.chatMembers.findFirst({
			where: and(
				eq(chatMembers.chatId, chatId),
				eq(chatMembers.userId, userId),
			),
		});
		return !!row;
	}
}
