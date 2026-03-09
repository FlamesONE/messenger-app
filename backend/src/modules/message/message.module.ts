import type { AppContext } from "@/infrastructure/di/container";
import { registerWorker } from "@/infrastructure/bullmq/worker-registry";
import { messageHttp } from "./message.http";
import { registerMessageWsHandlers } from "./message.ws";
import { SendMessageUseCase } from "./use-cases/send-message";
import { GetHistoryUseCase } from "./use-cases/get-history";
import { DeleteMessageUseCase } from "./use-cases/delete-message";
import { EditMessageUseCase } from "./use-cases/edit-message";
import { MarkAsReadUseCase } from "./use-cases/mark-as-read";
import { ToggleReactionUseCase } from "./use-cases/toggle-reaction";
import { GetReactionsUseCase } from "./use-cases/get-reactions";
import { SearchMessagesUseCase } from "./use-cases/search-messages";
import { NotificationJobHandler } from "./jobs/notification.handler";

export function createMessageModule(ctx: AppContext) {
	const sendMessageUC = new SendMessageUseCase(ctx.messageRepo, ctx.chatRepo, ctx.fileStorage);
	const getHistoryUC = new GetHistoryUseCase(ctx.messageRepo, ctx.chatRepo);
	const deleteMessageUC = new DeleteMessageUseCase(ctx.messageRepo);
	const editMessageUC = new EditMessageUseCase(ctx.messageRepo, ctx.chatRepo);
	const markAsReadUC = new MarkAsReadUseCase(ctx.messageRepo, ctx.chatRepo);
	const toggleReactionUC = new ToggleReactionUseCase(ctx.messageRepo);
	const getReactionsUC = new GetReactionsUseCase(ctx.messageRepo);
	const searchMessagesUC = new SearchMessagesUseCase(ctx.messageRepo, ctx.chatRepo);

	// job handlers
	const notificationHandler = new NotificationJobHandler(ctx.userRepo, ctx.eventBus);
	registerWorker("notification", notificationHandler, 5);

	// ws handlers
	registerMessageWsHandlers(sendMessageUC, ctx.wsRouter, ctx.eventBus);

	return {
		http: messageHttp(
			sendMessageUC,
			getHistoryUC,
			deleteMessageUC,
			editMessageUC,
			markAsReadUC,
			toggleReactionUC,
			getReactionsUC,
			searchMessagesUC,
			ctx.eventBus,
		),
	};
}
