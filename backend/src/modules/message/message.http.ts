import { Elysia, t } from "elysia";
import { authGuard } from "@/transport/auth.guard";
import { sendMessageDto } from "./dto/send-message.dto";
import type { DeleteMessageUseCase } from "./use-cases/delete-message";
import type { GetHistoryUseCase } from "./use-cases/get-history";
import type { MarkAsReadUseCase } from "./use-cases/mark-as-read";
import type { SendMessageUseCase } from "./use-cases/send-message";

export function messageHttp(
	sendMessageUC: SendMessageUseCase,
	getHistoryUC: GetHistoryUseCase,
	deleteMessageUC: DeleteMessageUseCase,
	markAsReadUC: MarkAsReadUseCase,
) {
	return new Elysia({ name: "message-http", prefix: "/messages" })
		.use(authGuard)
		.post(
			"/",
			async ({ body, userId }) => {
				return sendMessageUC.execute(userId, body);
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
				return { success: true };
			},
			{
				auth: true,
				params: t.Object({ chatId: t.String(), messageId: t.String() }),
			},
		);
}
