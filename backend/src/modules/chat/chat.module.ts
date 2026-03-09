import type { AppContext } from "@/infrastructure/di/container";
import { chatHttp } from "./chat.http";
import { registerChatWsHandlers } from "./chat.ws";
import { CreateChatUseCase } from "./use-cases/create-chat";
import { GetUserChatsUseCase } from "./use-cases/get-user-chats";
import { AddMemberUseCase } from "./use-cases/add-member";
import { GenerateInviteLinkUseCase } from "./use-cases/generate-invite-link";
import { JoinByInviteUseCase } from "./use-cases/join-by-invite";
import { GetChatMembersUseCase } from "./use-cases/get-chat-members";
import { LeaveChatUseCase } from "./use-cases/leave-chat";
import { DeleteChatUseCase } from "./use-cases/delete-chat";

export function createChatModule(ctx: AppContext) {
	const createChatUC = new CreateChatUseCase(ctx.chatRepo);
	const getUserChatsUC = new GetUserChatsUseCase(ctx.chatRepo, ctx.userRepo, ctx.messageRepo);
	const addMemberUC = new AddMemberUseCase(ctx.chatRepo);
	const generateInviteLinkUC = new GenerateInviteLinkUseCase(ctx.chatRepo);
	const joinByInviteUC = new JoinByInviteUseCase(ctx.chatRepo);
	const getChatMembersUC = new GetChatMembersUseCase(ctx.chatRepo, ctx.userRepo);
	const leaveChatUC = new LeaveChatUseCase(ctx.chatRepo);
	const deleteChatUC = new DeleteChatUseCase(ctx.chatRepo);

	registerChatWsHandlers(ctx.chatRepo, ctx.wsManager, ctx.wsRouter);

	return {
		http: chatHttp(createChatUC, getUserChatsUC, addMemberUC, generateInviteLinkUC, joinByInviteUC, getChatMembersUC, leaveChatUC, deleteChatUC),
	};
}
