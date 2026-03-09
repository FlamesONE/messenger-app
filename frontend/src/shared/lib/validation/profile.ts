import { z } from "zod/v4";

export const profileSchema = z.object({
	displayName: z.string().min(1, "Имя не может быть пустым").max(128, "Имя слишком длинное"),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
