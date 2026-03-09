import { Elysia, t } from "elysia";
import { authGuard } from "@/transport/auth.guard";
import type { EventBus } from "@/infrastructure/event-bus/event-bus";
import { sendMessageDto } from "./dto/send-message.dto";
import type { DeleteMessageUseCase } from "./use-cases/delete-message";
import type { EditMessageUseCase } from "./use-cases/edit-message";
import type { GetHistoryUseCase } from "./use-cases/get-history";
import type { GetReactionsUseCase } from "./use-cases/get-reactions";
import type { MarkAsReadUseCase } from "./use-cases/mark-as-read";
import type { SearchMessagesUseCase } from "./use-cases/search-messages";
import type { SendMessageUseCase } from "./use-cases/send-message";
import type { ToggleReactionUseCase } from "./use-cases/toggle-reaction";

export function messageHttp(
	sendMessageUC: SendMessageUseCase,
	getHistoryUC: GetHistoryUseCase,
	deleteMessageUC: DeleteMessageUseCase,
	editMessageUC: EditMessageUseCase,
	markAsReadUC: MarkAsReadUseCase,
	toggleReactionUC: ToggleReactionUseCase,
	getReactionsUC: GetReactionsUseCase,
	searchMessagesUC: SearchMessagesUseCase,
	eventBus: EventBus,
) {
	return new Elysia({ name: "message-http", prefix: "/messages" })
		.use(authGuard)
		.post(
			"/",
			async ({ body, userId }) => {
				const message = await sendMessageUC.execute(userId, body);

				eventBus.emit("broadcast:chat", {
					chatId: message.chatId,
					excludeUserId: userId,
					message: {
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
							replyTo: message.replyTo,
							createdAt: message.createdAt.toISOString(),
						},
					},
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
		.get(
			"/:chatId/search",
			async ({ params, query, userId }) => {
				const before = query.before ? new Date(query.before) : undefined;
				return searchMessagesUC.execute(
					userId,
					params.chatId,
					query.q,
					query.limit ? Number(query.limit) : undefined,
					before,
				);
			},
			{
				auth: true,
				params: t.Object({ chatId: t.String() }),
				query: t.Object({
					q: t.String({ minLength: 1 }),
					limit: t.Optional(t.Number({ minimum: 1, maximum: 50 })),
					before: t.Optional(t.String()),
				}),
			},
		)
		.delete(
			"/:chatId/:messageId",
			async ({ params, userId }) => {
				await deleteMessageUC.execute(userId, params.chatId, params.messageId);

				eventBus.emit("broadcast:chat", {
					chatId: params.chatId,
					excludeUserId: userId,
					message: {
						event: "message:deleted",
						data: {
							chatId: params.chatId,
							messageId: params.messageId,
						},
					},
				});

				return { success: true };
			},
			{
				auth: true,
				params: t.Object({ chatId: t.String(), messageId: t.String() }),
			},
		)
		.patch(
			"/:chatId/:messageId",
			async ({ params, body, userId }) => {
				const updated = await editMessageUC.execute(userId, params.chatId, params.messageId, body.content);

				eventBus.emit("broadcast:chat", {
					chatId: params.chatId,
					excludeUserId: userId,
					message: {
						event: "message:edited",
						data: {
							chatId: params.chatId,
							messageId: params.messageId,
							content: updated.content,
							editedAt: updated.editedAt!.toISOString(),
						},
					},
				});

				return updated;
			},
			{
				auth: true,
				params: t.Object({ chatId: t.String(), messageId: t.String() }),
				body: t.Object({ content: t.String({ minLength: 1, maxLength: 4096 }) }),
			},
		)
		.post(
			"/:chatId/read-batch",
			async ({ params, body, userId }) => {
				const { messageIds } = body;
				await markAsReadUC.executeBatch(userId, params.chatId, messageIds);

				for (const messageId of messageIds) {
					eventBus.emit("broadcast:chat", {
						chatId: params.chatId,
						excludeUserId: userId,
						message: {
							event: "message:read",
							data: {
								chatId: params.chatId,
								messageId,
								readBy: userId,
							},
						},
					});
				}

				return { success: true };
			},
			{
				auth: true,
				params: t.Object({ chatId: t.String() }),
				body: t.Object({ messageIds: t.Array(t.String(), { maxItems: 200 }) }),
			},
		)
		.post(
			"/:chatId/:messageId/read",
			async ({ params, userId }) => {
				await markAsReadUC.execute(userId, params.chatId, params.messageId);

				eventBus.emit("broadcast:chat", {
					chatId: params.chatId,
					excludeUserId: userId,
					message: {
						event: "message:read",
						data: {
							chatId: params.chatId,
							messageId: params.messageId,
							readBy: userId,
						},
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
			"/:chatId/:messageId/reactions",
			async ({ params, body, userId }) => {
				const { action } = await toggleReactionUC.execute(
					userId,
					params.chatId,
					params.messageId,
					body.emoji,
				);

				eventBus.emit("broadcast:chat", {
					chatId: params.chatId,
					excludeUserId: userId,
					message: {
						event: "message:reaction",
						data: {
							chatId: params.chatId,
							messageId: params.messageId,
							userId,
							emoji: body.emoji,
							action,
						},
					},
				});

				return { action };
			},
			{
				auth: true,
				params: t.Object({ chatId: t.String(), messageId: t.String() }),
				body: t.Object({ emoji: t.String() }),
			},
		)
		.get(
			"/:chatId/:messageId/reactions",
			async ({ params }) => {
				const reactions = await getReactionsUC.execute(params.chatId, params.messageId);
				return reactions;
			},
			{
				auth: true,
				params: t.Object({ chatId: t.String(), messageId: t.String() }),
			},
		);
}
