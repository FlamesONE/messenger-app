import { and, eq, inArray, sql } from "drizzle-orm";
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

	async findDmBetween(userIdA: string, userIdB: string): Promise<ChatRecord | null> {
		const rows = await db
			.select({ id: chats.id })
			.from(chats)
			.innerJoin(chatMembers, eq(chats.id, chatMembers.chatId))
			.where(
				and(
					eq(chats.isGroup, false),
					inArray(chatMembers.userId, [userIdA, userIdB]),
				),
			)
			.groupBy(chats.id)
			.having(sql`count(distinct ${chatMembers.userId}) = 2`);

		if (rows.length === 0) return null;
		return this.findById(rows[0].id);
	}

	async findByInviteCode(code: string): Promise<ChatRecord | null> {
		const row = await db.query.chats.findFirst({
			where: eq(chats.inviteCode, code),
		});
		return row ?? null;
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

	async setInviteCode(chatId: string, code: string): Promise<void> {
		await db.update(chats).set({ inviteCode: code }).where(eq(chats.id, chatId));
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

	async deleteChat(chatId: string): Promise<void> {
		await db.delete(chats).where(eq(chats.id, chatId));
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
