import type { IJobQueue } from "@/infrastructure/bullmq/types";
import type { IWsManager, IWsRouter } from "@/transport/ws.types";
import type { NotificationJobData } from "./jobs/notification.types";
import { messageHttp } from "./message.http";
import { registerMessageWsHandlers } from "./message.ws";
import type { DeleteMessageUseCase } from "./use-cases/delete-message";
import type { GetHistoryUseCase } from "./use-cases/get-history";
import type { MarkAsReadUseCase } from "./use-cases/mark-as-read";
import type { SendMessageUseCase } from "./use-cases/send-message";

export function createMessageModule(
	sendMessageUC: SendMessageUseCase,
	getHistoryUC: GetHistoryUseCase,
	deleteMessageUC: DeleteMessageUseCase,
	markAsReadUC: MarkAsReadUseCase,
	notificationQueue: IJobQueue<NotificationJobData>,
	wsManager: IWsManager,
	wsRouter: IWsRouter,
) {
	registerMessageWsHandlers(sendMessageUC, notificationQueue, wsManager, wsRouter);

	return {
		http: messageHttp(
			sendMessageUC,
			getHistoryUC,
			deleteMessageUC,
			markAsReadUC,
			notificationQueue,
			wsManager,
		),
	};
}
