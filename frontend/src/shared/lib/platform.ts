import { isTauri as checkTauri } from "@tauri-apps/api/core";

/** Whether the app is running inside Tauri (desktop/mobile) */
export const isTauri: boolean = (() => {
	try {
		return checkTauri();
	} catch {
		return false;
	}
})();

/** Whether the app is running in a regular browser */
export const isWeb = !isTauri;
