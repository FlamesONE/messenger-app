import type { IChatRepository } from "@/repositories/interfaces/chat.repository";
import { chatHttp } from "./chat.http";
import { registerChatWsHandlers } from "./chat.ws";
import { AddMemberUseCase } from "./use-cases/add-member";
import { CreateChatUseCase } from "./use-cases/create-chat";
import { GetUserChatsUseCase } from "./use-cases/get-user-chats";

export function createChatModule(chatRepo: IChatRepository) {
	const createChatUC = new CreateChatUseCase(chatRepo);
	const getUserChatsUC = new GetUserChatsUseCase(chatRepo);
	const addMemberUC = new AddMemberUseCase(chatRepo);

	registerChatWsHandlers();

	return {
		http: chatHttp(createChatUC, getUserChatsUC, addMemberUC),
	};
}
