export interface MediaAttachment {
	url: string;
	key: string;
	type: string;
	size: number;
	name: string;
}

export interface Message {
	id: string;
	chatId: string;
	senderId: string;
	content: string;
	media: MediaAttachment[];
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
}
