import type { IChatRepository } from "@/repositories/interfaces/chat.repository";
import type { IFileStorage } from "@/repositories/interfaces/file-storage";
import type { IMessageRepository } from "@/repositories/interfaces/message.repository";
import { messageHttp } from "./message.http";
import { registerMessageWsHandlers } from "./message.ws";
import { DeleteMessageUseCase } from "./use-cases/delete-message";
import { GetHistoryUseCase } from "./use-cases/get-history";
import { MarkAsReadUseCase } from "./use-cases/mark-as-read";
import { SendMessageUseCase } from "./use-cases/send-message";

export function createMessageModule(
	messageRepo: IMessageRepository,
	chatRepo: IChatRepository,
	fileStorage: IFileStorage,
) {
	const sendMessageUC = new SendMessageUseCase(
		messageRepo,
		chatRepo,
		fileStorage,
	);
	const getHistoryUC = new GetHistoryUseCase(messageRepo, chatRepo);
	const deleteMessageUC = new DeleteMessageUseCase(messageRepo);
	const markAsReadUC = new MarkAsReadUseCase(messageRepo, chatRepo);

	registerMessageWsHandlers(sendMessageUC);

	return {
		http: messageHttp(
			sendMessageUC,
			getHistoryUC,
			deleteMessageUC,
			markAsReadUC,
		),
	};
}
