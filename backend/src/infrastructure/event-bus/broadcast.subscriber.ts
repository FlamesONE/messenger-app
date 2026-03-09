import type { AppContext } from "@/infrastructure/di/container";

export function registerBroadcastSubscribers(ctx: AppContext) {
	ctx.eventBus.on("broadcast:chat", async ({ chatId, excludeUserId, message }) => {
		const members = await ctx.chatRepo.getMembers(chatId);
		for (const member of members) {
			if (member.userId === excludeUserId) continue;
			ctx.wsManager.broadcastToUser(member.userId, message);
		}
	});

	ctx.eventBus.on("broadcast:user-contacts", async ({ userId, message }) => {
		const chats = await ctx.chatRepo.findByUserId(userId);
		const notified = new Set<string>();

		for (const chat of chats) {
			const members = await ctx.chatRepo.getMembers(chat.id);
			for (const member of members) {
				if (member.userId === userId || notified.has(member.userId)) continue;
				notified.add(member.userId);
				ctx.wsManager.broadcastToUser(member.userId, message);
			}
		}
	});
}
