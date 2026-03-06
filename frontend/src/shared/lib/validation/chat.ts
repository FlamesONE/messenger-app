import { z } from "zod/v4";

export const createChatSchema = z.object({
	isGroup: z.boolean(),
	memberIds: z.string().min(1, "Введите ID пользователя"),
	groupName: z.string().optional(),
});

export type CreateChatFormData = z.infer<typeof createChatSchema>;
