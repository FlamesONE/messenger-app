import { Elysia, t } from "elysia";
import type { IJobQueue } from "@/infrastructure/bullmq/types";
import type { IWsManager } from "@/transport/ws.types";
import { authGuard } from "@/transport/auth.guard";
import { sendMessageDto } from "./dto/send-message.dto";
import type { NotificationJobData } from "./jobs/notification.types";
import type { DeleteMessageUseCase } from "./use-cases/delete-message";
import type { GetHistoryUseCase } from "./use-cases/get-history";
import type { MarkAsReadUseCase } from "./use-cases/mark-as-read";
import type { SendMessageUseCase } from "./use-cases/send-message";

export function messageHttp(
	sendMessageUC: SendMessageUseCase,
	getHistoryUC: GetHistoryUseCase,
	deleteMessageUC: DeleteMessageUseCase,
	markAsReadUC: MarkAsReadUseCase,
	notificationQueue: IJobQueue<NotificationJobData>,
	wsManager: IWsManager,
) {
	return new Elysia({ name: "message-http", prefix: "/messages" })
		.use(authGuard)
		.post(
			"/",
			async ({ body, userId }) => {
				const message = await sendMessageUC.execute(userId, body);

				wsManager.broadcastToChat(body.chatId, {
					event: "message:new",
					data: {
						chatId: message.chatId,
						messageId: message.id,
						senderId: message.senderId,
						content: message.content,
						media: message.media.map((m) => ({
							url: m.url,
							type: m.type,
							name: m.name,
						})),
						createdAt: message.createdAt.toISOString(),
					},
				});

				await notificationQueue.add("new-message", {
					chatId: message.chatId,
					messageId: message.id,
					senderId: message.senderId,
					content: message.content,
				});

				return message;
			},
			{ auth: true, body: sendMessageDto },
		)
		.get(
			"/:chatId",
			async ({ params, query, userId }) => {
				const before = query.before ? new Date(query.before) : undefined;
				return getHistoryUC.execute(userId, params.chatId, query.limit, before);
			},
			{
				auth: true,
				params: t.Object({ chatId: t.String() }),
				query: t.Object({
					limit: t.Optional(t.Number({ minimum: 1, maximum: 100 })),
					before: t.Optional(t.String()),
				}),
			},
		)
		.delete(
			"/:chatId/:messageId",
			async ({ params, userId }) => {
				await deleteMessageUC.execute(userId, params.chatId, params.messageId);

				wsManager.broadcastToChat(params.chatId, {
					event: "message:deleted",
					data: {
						chatId: params.chatId,
						messageId: params.messageId,
					},
				});

				return { success: true };
			},
			{
				auth: true,
				params: t.Object({ chatId: t.String(), messageId: t.String() }),
			},
		)
		.post(
			"/:chatId/:messageId/read",
			async ({ params, userId }) => {
				await markAsReadUC.execute(userId, params.chatId, params.messageId);

				wsManager.broadcastToChat(params.chatId, {
					event: "message:read",
					data: {
						chatId: params.chatId,
						messageId: params.messageId,
						readBy: userId,
					},
				});

				return { success: true };
			},
			{
				auth: true,
				params: t.Object({ chatId: t.String(), messageId: t.String() }),
			},
		);
}
