import { z } from "zod";

export const sendMessageDto = z.object({
	chatId: z.string().min(1),
	content: z.string().max(4096).default(""),
	mediaKeys: z.array(z.string()).max(10).optional(),
});

export type SendMessageDto = z.infer<typeof sendMessageDto>;
