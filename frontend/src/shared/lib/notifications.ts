import { isTauri } from "./platform";
import { useAppSettings } from "./app-settings-store";

type NotificationModule = typeof import("@tauri-apps/plugin-notification");
let tauriNotification: NotificationModule | null = null;

async function getTauriNotification(): Promise<NotificationModule | null> {
	if (!isTauri) return null;
	if (tauriNotification) return tauriNotification;
	try {
		tauriNotification = await import("@tauri-apps/plugin-notification");
		return tauriNotification;
	} catch {
		return null;
	}
}

export async function requestNotificationPermission(): Promise<boolean> {
	if (isTauri) {
		const mod = await getTauriNotification();
		if (!mod) return false;
		let perm = await mod.isPermissionGranted();
		if (!perm) {
			const result = await mod.requestPermission();
			perm = result === "granted";
		}
		return perm;
	}

	if (!("Notification" in window)) return false;
	if (Notification.permission === "granted") return true;
	const result = await Notification.requestPermission();
	return result === "granted";
}

export async function showNotification(
	title: string,
	body: string,
	options?: { icon?: string },
) {
	const { notificationsEnabled } = useAppSettings.getState();
	if (!notificationsEnabled) return;

	const icon = options?.icon || "/icon-192.png";

	if (isTauri) {
		const mod = await getTauriNotification();
		if (!mod) return;
		const granted = await mod.isPermissionGranted();
		if (!granted) return;
		mod.sendNotification({ title, body });
		return;
	}

	if (!("Notification" in window)) return;
	if (Notification.permission !== "granted") return;
	new Notification(title, { body, icon });
}

export function playNotificationSound() {
	const { soundEnabled } = useAppSettings.getState();
	if (!soundEnabled) return;
	try {
		const audio = new Audio("/gun.mp3");
		audio.volume = 0.3;
		audio.play().catch(() => {});
	} catch {
		/* ignore */
	}
}
