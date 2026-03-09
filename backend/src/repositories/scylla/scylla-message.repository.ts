import { nanoid } from "nanoid";
import type {
	CreateMessageData,
	GetMessagesParams,
	IMessageRepository,
	MediaAttachment,
	MessageRecord,
	ReactionRecord,
	SearchMessagesParams,
} from "@/repositories/interfaces/message.repository";
import { scyllaClient } from "@/infrastructure/scylla/client";
import type { types } from "cassandra-driver";

const Q = {
	findById:
		"SELECT * FROM messages WHERE chat_id = ? AND created_at = ? AND id = ? LIMIT 1",
	findByIdWithIndex:
		"SELECT * FROM messages WHERE chat_id = ? AND id = ? LIMIT 1",
	historyBefore:
		"SELECT * FROM messages WHERE chat_id = ? AND created_at < ? ORDER BY created_at DESC LIMIT ?",
	history:
		"SELECT * FROM messages WHERE chat_id = ? ORDER BY created_at DESC LIMIT ?",
	insert:
		"INSERT INTO messages (id, chat_id, sender_id, content, media, reply_to, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
	updateContent:
		"UPDATE messages SET content = ?, edited_at = ?, updated_at = ? WHERE chat_id = ? AND created_at = ? AND id = ?",
	softDelete:
		"UPDATE messages SET deleted_at = ? WHERE chat_id = ? AND created_at = ? AND id = ?",
	markAsRead:
		"INSERT INTO message_reads (chat_id, message_id, user_id, read_at) VALUES (?, ?, ?, ?)",
	addReaction:
		"INSERT INTO message_reactions (chat_id, message_id, user_id, emoji, created_at) VALUES (?, ?, ?, ?, ?)",
	removeReaction:
		"DELETE FROM message_reactions WHERE chat_id = ? AND message_id = ? AND user_id = ? AND emoji = ?",
	getReactions:
		"SELECT * FROM message_reactions WHERE chat_id = ? AND message_id = ?",
	getReaders:
		"SELECT user_id FROM message_reads WHERE chat_id = ? AND message_id = ?",
} as const;

export class ScyllaMessageRepository implements IMessageRepository {
	async findById(
		chatId: string,
		messageId: string,
	): Promise<MessageRecord | null> {
		const result = await scyllaClient.execute(
			Q.findByIdWithIndex,
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

	async getLastMessage(chatId: string): Promise<MessageRecord | null> {
		const result = await scyllaClient.execute(
			Q.history,
			[chatId, 1],
			{ prepare: true },
		);
		const row = result.rows[0];
		if (!row) return null;
		const msg = this.mapRow(row);
		return msg.deletedAt ? null : msg;
	}

	async searchMessages(params: SearchMessagesParams): Promise<MessageRecord[]> {
		const limit = params.limit ?? 30;
		const pageSize = 200;
		const maxPages = 5;
		const q = params.query.toLowerCase();

		const matched: MessageRecord[] = [];
		let cursor: Date | undefined = params.before;

		for (let page = 0; page < maxPages && matched.length < limit; page++) {
			const [query, values]: [string, unknown[]] = cursor
				? [Q.historyBefore, [params.chatId, cursor, pageSize]]
				: [Q.history, [params.chatId, pageSize]];

			const result = await scyllaClient.execute(query, values, { prepare: true });
			if (result.rows.length === 0) break;

			for (const row of result.rows) {
				if (matched.length >= limit) break;
				const msg = this.mapRow(row);
				if (msg.deletedAt) continue;
				if (msg.content.toLowerCase().includes(q)) {
					matched.push(msg);
				}
			}

			const lastRow = result.rows[result.rows.length - 1];
			cursor = lastRow.get("created_at") as Date;

			if (result.rows.length < pageSize) break;
		}

		return matched;
	}

	async create(data: CreateMessageData): Promise<MessageRecord> {
		const id = nanoid();
		const now = new Date();
		const mediaJson = JSON.stringify(data.media ?? []);

		await scyllaClient.execute(
			Q.insert,
			[id, data.chatId, data.senderId, data.content, mediaJson, data.replyTo ?? null, now, now],
			{ prepare: true },
		);

		return {
			id,
			chatId: data.chatId,
			senderId: data.senderId,
			content: data.content,
			media: data.media ?? [],
			replyTo: data.replyTo ?? null,
			editedAt: null,
			createdAt: now,
			updatedAt: now,
			deletedAt: null,
		};
	}

	async update(chatId: string, messageId: string, content: string): Promise<MessageRecord | null> {
		const msg = await this.findById(chatId, messageId);
		if (!msg) return null;

		const now = new Date();
		await scyllaClient.execute(
			Q.updateContent,
			[content, now, now, chatId, msg.createdAt, messageId],
			{ prepare: true },
		);

		return { ...msg, content, editedAt: now, updatedAt: now };
	}

	async delete(chatId: string, messageId: string): Promise<void> {
		const msg = await this.findById(chatId, messageId);
		if (!msg) return;

		await scyllaClient.execute(
			Q.softDelete,
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

	async markAsReadBatch(
		chatId: string,
		messageIds: string[],
		userId: string,
	): Promise<void> {
		if (messageIds.length === 0) return;
		const now = new Date();
		const queries = messageIds.map((messageId) => ({
			query: Q.markAsRead,
			params: [chatId, messageId, userId, now],
		}));
		await scyllaClient.batch(queries, { prepare: true });
	}

	async addReaction(
		chatId: string,
		messageId: string,
		userId: string,
		emoji: string,
	): Promise<ReactionRecord> {
		const now = new Date();
		await scyllaClient.execute(
			Q.addReaction,
			[chatId, messageId, userId, emoji, now],
			{ prepare: true },
		);
		return { chatId, messageId, userId, emoji, createdAt: now };
	}

	async removeReaction(
		chatId: string,
		messageId: string,
		userId: string,
		emoji: string,
	): Promise<void> {
		await scyllaClient.execute(
			Q.removeReaction,
			[chatId, messageId, userId, emoji],
			{ prepare: true },
		);
	}

	async getReactions(
		chatId: string,
		messageId: string,
	): Promise<ReactionRecord[]> {
		const result = await scyllaClient.execute(
			Q.getReactions,
			[chatId, messageId],
			{ prepare: true },
		);
		return result.rows.map((row) => this.mapReactionRow(row));
	}

	async getReaders(chatId: string, messageId: string): Promise<string[]> {
		const result = await scyllaClient.execute(
			Q.getReaders,
			[chatId, messageId],
			{ prepare: true },
		);
		return result.rows.map((row) => row.get("user_id") as string);
	}

	async getReadersBatch(
		chatId: string,
		messageIds: string[],
	): Promise<Map<string, string[]>> {
		const map = new Map<string, string[]>();
		const promises = messageIds.map(async (msgId) => {
			const readers = await this.getReaders(chatId, msgId);
			if (readers.length > 0) map.set(msgId, readers);
		});
		await Promise.all(promises);
		return map;
	}

	async getReactionsBatch(
		chatId: string,
		messageIds: string[],
	): Promise<Map<string, ReactionRecord[]>> {
		const map = new Map<string, ReactionRecord[]>();
		const promises = messageIds.map(async (msgId) => {
			const reactions = await this.getReactions(chatId, msgId);
			if (reactions.length > 0) map.set(msgId, reactions);
		});
		await Promise.all(promises);
		return map;
	}

	private mapReactionRow(row: types.Row): ReactionRecord {
		return {
			chatId: row.get("chat_id") as string,
			messageId: row.get("message_id") as string,
			userId: row.get("user_id") as string,
			emoji: row.get("emoji") as string,
			createdAt: row.get("created_at") as Date,
		};
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
			replyTo: (row.get("reply_to") as string) ?? null,
			editedAt: (row.get("edited_at") as Date) ?? null,
			createdAt: row.get("created_at") as Date,
			updatedAt: row.get("updated_at") as Date,
			deletedAt: (row.get("deleted_at") as Date) ?? null,
		};
	}
}
