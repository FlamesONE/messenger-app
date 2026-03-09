import type { WsEventMap } from "@/shared/types/ws-events";

export interface AppEvents {
	"broadcast:chat": {
		chatId: string;
		excludeUserId: string;
		message: { event: keyof WsEventMap; data: unknown };
	};
	"broadcast:user-contacts": {
		userId: string;
		message: { event: keyof WsEventMap; data: unknown };
	};
}

type EventHandler<T> = (payload: T) => void | Promise<void>;

export class EventBus {
	private handlers = new Map<string, EventHandler<unknown>[]>();

	on<K extends keyof AppEvents>(event: K, handler: EventHandler<AppEvents[K]>): void {
		const list = this.handlers.get(event) ?? [];
		list.push(handler as EventHandler<unknown>);
		this.handlers.set(event, list);
	}

	async emit<K extends keyof AppEvents>(event: K, payload: AppEvents[K]): Promise<void> {
		const list = this.handlers.get(event);
		if (!list) return;
		await Promise.all(list.map((h) => h(payload)));
	}
}
