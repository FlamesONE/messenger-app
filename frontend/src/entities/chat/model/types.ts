export interface Chat {
	id: string;
	name: string | null;
	isGroup: boolean;
	createdById: string;
	createdAt: string;
	updatedAt: string;
	lastMessage?: {
		content: string;
		senderId: string;
		createdAt: string;
	} | null;
}
