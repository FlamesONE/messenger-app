import { Elysia, t } from "elysia";
import { authGuard } from "@/transport/auth.guard";
import { createChatDto } from "./dto/create-chat.dto";
import type { AddMemberUseCase } from "./use-cases/add-member";
import type { CreateChatUseCase } from "./use-cases/create-chat";
import type { GenerateInviteLinkUseCase } from "./use-cases/generate-invite-link";
import type { GetChatMembersUseCase } from "./use-cases/get-chat-members";
import type { GetUserChatsUseCase } from "./use-cases/get-user-chats";
import type { JoinByInviteUseCase } from "./use-cases/join-by-invite";
import type { LeaveChatUseCase } from "./use-cases/leave-chat";
import type { DeleteChatUseCase } from "./use-cases/delete-chat";

export function chatHttp(
	createChatUC: CreateChatUseCase,
	getUserChatsUC: GetUserChatsUseCase,
	addMemberUC: AddMemberUseCase,
	generateInviteLinkUC: GenerateInviteLinkUseCase,
	joinByInviteUC: JoinByInviteUseCase,
	getChatMembersUC: GetChatMembersUseCase,
	leaveChatUC: LeaveChatUseCase,
	deleteChatUC: DeleteChatUseCase,
) {
	return new Elysia({ name: "chat-http", prefix: "/chats" })
		.use(authGuard)
		.post(
			"/",
			async ({ body, userId }) => {
				return createChatUC.execute(userId, body);
			},
			{ auth: true, body: createChatDto },
		)
		.get("/", async ({ userId }) => {
			const result = await getUserChatsUC.execute(userId);
			return Response.json(result);
		}, { auth: true })
		.get(
			"/:chatId/members",
			async ({ params, userId }) => {
				return getChatMembersUC.execute(userId, params.chatId);
			},
			{
				auth: true,
				params: t.Object({ chatId: t.String() }),
			},
		)
		.post(
			"/:chatId/members",
			async ({ params, body, userId }) => {
				await addMemberUC.execute(userId, params.chatId, body.userId);
				return { success: true };
			},
			{
				auth: true,
				params: t.Object({ chatId: t.String() }),
				body: t.Object({ userId: t.String() }),
			},
		)
		.post(
			"/:chatId/invite",
			async ({ params, userId }) => {
				const code = await generateInviteLinkUC.execute(userId, params.chatId);
				return { inviteCode: code };
			},
			{
				auth: true,
				params: t.Object({ chatId: t.String() }),
			},
		)
		.post(
			"/join/:inviteCode",
			async ({ params, userId }) => {
				return joinByInviteUC.execute(userId, params.inviteCode);
			},
			{
				auth: true,
				params: t.Object({ inviteCode: t.String() }),
			},
		)
		.delete(
			"/:chatId/leave",
			async ({ params, userId }) => {
				await leaveChatUC.execute(userId, params.chatId);
				return { success: true };
			},
			{
				auth: true,
				params: t.Object({ chatId: t.String() }),
			},
		)
		.delete(
			"/:chatId",
			async ({ params, userId }) => {
				await deleteChatUC.execute(userId, params.chatId);
				return { success: true };
			},
			{
				auth: true,
				params: t.Object({ chatId: t.String() }),
			},
		);
}
