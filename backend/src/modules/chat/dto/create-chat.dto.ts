import { t } from "elysia";

export const createChatDto = t.Object({
	name: t.Optional(t.String({ minLength: 1, maxLength: 255 })),
	isGroup: t.Boolean({ default: false }),
	memberIds: t.Array(t.String(), { minItems: 1 }),
});

export type CreateChatDto = typeof createChatDto.static;
