import { Elysia, t } from "elysia";
import { authGuard } from "@/transport/auth.guard";
import { createChatDto } from "./dto/create-chat.dto";
import type { AddMemberUseCase } from "./use-cases/add-member";
import type { CreateChatUseCase } from "./use-cases/create-chat";
import type { GetUserChatsUseCase } from "./use-cases/get-user-chats";

export function chatHttp(
	createChatUC: CreateChatUseCase,
	getUserChatsUC: GetUserChatsUseCase,
	addMemberUC: AddMemberUseCase,
) {
	return new Elysia({ name: "chat-http", prefix: "/chats" })
		.use(authGuard)
		.post(
			"/",
			async ({ body, userId }) => {
				return createChatUC.execute(userId, body);
			},
			{ body: createChatDto },
		)
		.get("/", async ({ userId }) => {
			return getUserChatsUC.execute(userId);
		})
		.post(
			"/:chatId/members",
			async ({ params, body, userId }) => {
				await addMemberUC.execute(userId, params.chatId, body.userId);
				return { success: true };
			},
			{
				params: t.Object({ chatId: t.String() }),
				body: t.Object({ userId: t.String() }),
			},
		);
}
