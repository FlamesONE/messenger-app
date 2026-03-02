import { nanoid } from "nanoid";
import type {
	CreateMessageData,
	GetMessagesParams,
	IMessageRepository,
	MediaAttachment,
	MessageRecord,
} from "@/repositories/interfaces/message.repository";
import { scyllaClient } from "@/infrastructure/scylla/client";
import type { types } from "cassandra-driver";

// ─── Prepared query strings ─────────────────────────────

const Q = {
	findById:
		"SELECT * FROM messages WHERE chat_id = ? AND created_at = ? AND id = ? LIMIT 1",
	findByIdScan:
		"SELECT * FROM messages WHERE chat_id = ? AND id = ? LIMIT 1 ALLOW FILTERING",
	historyBefore:
		"SELECT * FROM messages WHERE chat_id = ? AND created_at < ? ORDER BY created_at DESC LIMIT ?",
	history:
		"SELECT * FROM messages WHERE chat_id = ? ORDER BY created_at DESC LIMIT ?",
	insert:
		"INSERT INTO messages (id, chat_id, sender_id, content, media, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
	softDelete:
		"UPDATE messages SET deleted_at = ? WHERE chat_id = ? AND created_at = ? AND id = ?",
	softDeleteScan:
		"UPDATE messages SET deleted_at = ? WHERE chat_id = ? AND created_at = (SELECT created_at FROM messages WHERE chat_id = ? AND id = ? LIMIT 1 ALLOW FILTERING) AND id = ?",
	markAsRead:
		"INSERT INTO message_reads (chat_id, message_id, user_id, read_at) VALUES (?, ?, ?, ?)",
} as const;

export class ScyllaMessageRepository implements IMessageRepository {
	async findById(
		chatId: string,
		messageId: string,
	): Promise<MessageRecord | null> {
		const result = await scyllaClient.execute(
			Q.findByIdScan,
			[chatId, messageId],
			{ prepare: true },
		);
		const row = result.rows[0];
		if (!row) return null;
		return this.mapRow(row);
	}

	async getHistory(params: GetMessagesParams): Promise<MessageRecord[]> {
		const limit = params.limit ?? 50;

		const [query, values]: [string, unknown[]] = params.before
			? [Q.historyBefore, [params.chatId, params.before, limit]]
			: [Q.history, [params.chatId, limit]];

		const result = await scyllaClient.execute(query, values, {
			prepare: true,
		});
		return result.rows.map((row) => this.mapRow(row));
	}

	async create(data: CreateMessageData): Promise<MessageRecord> {
		const id = nanoid();
		const now = new Date();
		const mediaJson = JSON.stringify(data.media ?? []);

		await scyllaClient.execute(
			Q.insert,
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
		const msg = await this.findById(chatId, messageId);
		if (!msg) return;

		await scyllaClient.execute(
			"UPDATE messages SET deleted_at = ? WHERE chat_id = ? AND created_at = ? AND id = ?",
			[new Date(), chatId, msg.createdAt, messageId],
			{ prepare: true },
		);
	}

	async markAsRead(
		chatId: string,
		messageId: string,
		userId: string,
	): Promise<void> {
		await scyllaClient.execute(
			Q.markAsRead,
			[chatId, messageId, userId, new Date()],
			{ prepare: true },
		);
	}

	private mapRow(row: types.Row): MessageRecord {
		let media: MediaAttachment[] = [];
		try {
			const raw = row.get("media") as string | null;
			if (raw) media = JSON.parse(raw);
		} catch {
			media = [];
		}

		return {
			id: row.get("id") as string,
			chatId: row.get("chat_id") as string,
			senderId: row.get("sender_id") as string,
			content: (row.get("content") as string) ?? "",
			media,
			createdAt: row.get("created_at") as Date,
			updatedAt: row.get("updated_at") as Date,
			deletedAt: (row.get("deleted_at") as Date) ?? null,
		};
	}
}
