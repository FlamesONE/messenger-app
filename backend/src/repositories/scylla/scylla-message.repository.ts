import { nanoid } from "nanoid";
import type {
	CreateMessageData,
	GetMessagesParams,
	IMessageRepository,
	MediaAttachment,
	MessageRecord,
} from "@/repositories/interfaces/message.repository";
import { scyllaClient } from "./scylla.client";

export class ScyllaMessageRepository implements IMessageRepository {
	async findById(
		chatId: string,
		messageId: string,
	): Promise<MessageRecord | null> {
		const query = "SELECT * FROM messages WHERE chat_id = ? AND id = ? LIMIT 1";
		const result = await scyllaClient.execute(query, [chatId, messageId], {
			prepare: true,
		});
		const row = result.rows[0];
		if (!row) return null;
		return this.mapRow(row);
	}

	async getHistory(params: GetMessagesParams): Promise<MessageRecord[]> {
		const limit = params.limit ?? 50;
		let query: string;
		let values: unknown[];

		if (params.before) {
			query =
				"SELECT * FROM messages WHERE chat_id = ? AND created_at < ? ORDER BY created_at DESC LIMIT ?";
			values = [params.chatId, params.before, limit];
		} else {
			query =
				"SELECT * FROM messages WHERE chat_id = ? ORDER BY created_at DESC LIMIT ?";
			values = [params.chatId, limit];
		}

		const result = await scyllaClient.execute(query, values, {
			prepare: true,
		});
		return result.rows.map((row) => this.mapRow(row));
	}

	async create(data: CreateMessageData): Promise<MessageRecord> {
		const id = nanoid();
		const now = new Date();
		const mediaJson = JSON.stringify(data.media ?? []);
		const query =
			"INSERT INTO messages (id, chat_id, sender_id, content, media, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)";

		await scyllaClient.execute(
			query,
			[id, data.chatId, data.senderId, data.content, mediaJson, now, now],
			{ prepare: true },
		);

		return {
			id,
			chatId: data.chatId,
			senderId: data.senderId,
			content: data.content,
			media: data.media ?? [],
			createdAt: now,
			updatedAt: now,
			deletedAt: null,
		};
	}

	async delete(chatId: string, messageId: string): Promise<void> {
		const query =
			"UPDATE messages SET deleted_at = ? WHERE chat_id = ? AND id = ?";
		await scyllaClient.execute(query, [new Date(), chatId, messageId], {
			prepare: true,
		});
	}

	async markAsRead(
		chatId: string,
		messageId: string,
		userId: string,
	): Promise<void> {
		const query =
			"INSERT INTO message_reads (chat_id, message_id, user_id, read_at) VALUES (?, ?, ?, ?)";
		await scyllaClient.execute(query, [chatId, messageId, userId, new Date()], {
			prepare: true,
		});
	}

	private mapRow(row: Record<string, unknown>): MessageRecord {
		let media: MediaAttachment[] = [];
		try {
			const raw = row.media as string | null;
			if (raw) media = JSON.parse(raw);
		} catch {
			media = [];
		}

		return {
			id: row.id as string,
			chatId: row.chat_id as string,
			senderId: row.sender_id as string,
			content: row.content as string,
			media,
			createdAt: row.created_at as Date,
			updatedAt: row.updated_at as Date,
			deletedAt: (row.deleted_at as Date) ?? null,
		};
	}
}
