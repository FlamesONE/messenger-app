import type { App } from "@backend/main";
import { treaty } from "@elysiajs/eden";
import { useAuthStore } from "@/entities/user";
import { getApiUrl } from "@/shared/lib/app-settings-store";

function createApi() {
	const baseUrl = import.meta.env.VITE_API_URL || getApiUrl();
	return treaty<App>(baseUrl, {
		headers: () => {
			const token = useAuthStore.getState().token;
			if (token) return { authorization: `Bearer ${token}` };
		},
	});
}

export let api = createApi();

/** Recreate API client (call after changing server URL, then reload) */
export function refreshApiClient() {
	api = createApi();
}
