import { t } from "elysia";

export const sendMessageDto = t.Object({
	chatId: t.String({ minLength: 1 }),
	content: t.String({ maxLength: 4096, default: "" }),
	mediaKeys: t.Optional(t.Array(t.String(), { maxItems: 10 })),
	replyTo: t.Optional(t.String()),
});

export type SendMessageDto = typeof sendMessageDto.static;
