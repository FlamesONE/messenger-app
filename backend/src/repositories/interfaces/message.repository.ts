export interface MediaAttachment {
	url: string;
	key: string;
	type: string;
	size: number;
	name: string;
}

export interface MessageRecord {
	id: string;
	chatId: string;
	senderId: string;
	content: string;
	media: MediaAttachment[];
	createdAt: Date;
	updatedAt: Date;
	deletedAt: Date | null;
}

export interface CreateMessageData {
	chatId: string;
	senderId: string;
	content: string;
	media?: MediaAttachment[];
}

export interface GetMessagesParams {
	chatId: string;
	limit?: number;
	before?: Date;
}

export interface IMessageRepository {
	findById(chatId: string, messageId: string): Promise<MessageRecord | null>;
	getHistory(params: GetMessagesParams): Promise<MessageRecord[]>;
	create(data: CreateMessageData): Promise<MessageRecord>;
	delete(chatId: string, messageId: string): Promise<void>;
	markAsRead(chatId: string, messageId: string, userId: string): Promise<void>;
}
