import { usePresenceStore } from "@/entities/user";
import type { WsEventMap } from "@backend/shared/types/ws-events";

export function handlePresence(data: WsEventMap["chat:presence"]) {
	const presence = usePresenceStore.getState();
	if (data.status === "online") {
		presence.setOnline(data.userId);
	} else {
		presence.setOffline(data.userId, data.lastSeen);
	}
}
