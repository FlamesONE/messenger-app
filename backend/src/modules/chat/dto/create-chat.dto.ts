import { z } from "zod";

export const createChatDto = z.object({
	name: z.string().min(1).max(255).optional(),
	isGroup: z.boolean().default(false),
	memberIds: z.array(z.string()).min(1),
});

export type CreateChatDto = z.infer<typeof createChatDto>;
