import { create } from "zustand";
import { persist } from "zustand/middleware";
import { isTauri } from "./platform";

const DEFAULT_SERVER_URL = isTauri ? "http://localhost:3000" : "";

interface AppSettingsState {
	notificationsEnabled: boolean;
	setNotificationsEnabled: (value: boolean) => void;

	soundEnabled: boolean;
	setSoundEnabled: (value: boolean) => void;

	/** Whether the notification permission banner was dismissed */
	notificationBannerDismissed: boolean;
	setNotificationBannerDismissed: (value: boolean) => void;

	/** Server URL (e.g. https://fasty.flute-cms.com or http://localhost:3000) */
	serverUrl: string;
	setServerUrl: (value: string) => void;
}

export const useAppSettings = create<AppSettingsState>()(
	persist(
		(set) => ({
			notificationsEnabled: true,
			setNotificationsEnabled: (value) => set({ notificationsEnabled: value }),

			soundEnabled: true,
			setSoundEnabled: (value) => set({ soundEnabled: value }),

			notificationBannerDismissed: false,
			setNotificationBannerDismissed: (value) => set({ notificationBannerDismissed: value }),

			serverUrl: DEFAULT_SERVER_URL,
			setServerUrl: (value) => set({ serverUrl: value.replace(/\/+$/, "") }),
		}),
		{ name: "app-settings" },
	),
);

/** Resolved API URL — for direct server connections (Tauri) or proxied (web) */
export function getApiUrl(): string {
	const stored = useAppSettings.getState().serverUrl;
	if (stored) return stored;
	return `${window.location.protocol}//${window.location.host}/api`;
}

/** Resolved WebSocket URL */
export function getWsUrl(): string {
	const stored = useAppSettings.getState().serverUrl;
	if (stored) {
		const wsProtocol = stored.startsWith("https") ? "wss:" : "ws:";
		const host = stored.replace(/^https?:\/\//, "");
		return `${wsProtocol}//${host}/ws`;
	}
	const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
	return `${protocol}//${window.location.host}/ws`;
}
