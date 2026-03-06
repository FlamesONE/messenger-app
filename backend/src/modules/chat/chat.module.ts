import type { IChatRepository } from "@/repositories/interfaces/chat.repository";
import type { IWsManager, IWsRouter } from "@/transport/ws.types";
import { chatHttp } from "./chat.http";
import { registerChatWsHandlers } from "./chat.ws";
import type { AddMemberUseCase } from "./use-cases/add-member";
import type { CreateChatUseCase } from "./use-cases/create-chat";
import type { GetUserChatsUseCase } from "./use-cases/get-user-chats";

export function createChatModule(
	chatRepo: IChatRepository,
	createChatUC: CreateChatUseCase,
	getUserChatsUC: GetUserChatsUseCase,
	addMemberUC: AddMemberUseCase,
	wsManager: IWsManager,
	wsRouter: IWsRouter,
) {
	registerChatWsHandlers(chatRepo, wsManager, wsRouter);

	return {
		http: chatHttp(createChatUC, getUserChatsUC, addMemberUC),
	};
}
