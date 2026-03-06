import type { App } from "@backend/main";
import { treaty } from "@elysiajs/eden";
import { useAuthStore } from "@/entities/user/model/store";

const baseUrl =
	import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.host}/api`;

export const api = treaty<App>(baseUrl, {
	headers: () => {
		const token = useAuthStore.getState().token;
		if (token) return { authorization: `Bearer ${token}` };
	},
});
