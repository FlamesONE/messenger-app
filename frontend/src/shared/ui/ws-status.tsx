import { Loader2, ShieldAlert, Wifi, WifiOff } from "lucide-react";
import { memo } from "react";
import { cn } from "@/shared/lib/utils";
import { useWsStatus, type WsStatus } from "@/shared/lib/ws-status";

const STATUS_CONFIG: Record<
	WsStatus,
	{ label: string; icon: typeof Wifi; color: string; pulse?: boolean }
> = {
	disconnected: {
		label: "Нет соединения",
		icon: WifiOff,
		color: "text-muted-foreground",
	},
	connecting: {
		label: "Соединение...",
		icon: Loader2,
		color: "text-amber-500",
		pulse: true,
	},
	authenticating: {
		label: "Авторизация...",
		icon: Loader2,
		color: "text-amber-500",
		pulse: true,
	},
	connected: {
		label: "Подключено",
		icon: Wifi,
		color: "text-emerald-500",
	},
	error: {
		label: "Ошибка подключения",
		icon: ShieldAlert,
		color: "text-destructive",
	},
};

export const WsStatusIndicator = memo(function WsStatusIndicator() {
	const status = useWsStatus((s) => s.status);
	const config = STATUS_CONFIG[status];
	const Icon = config.icon;

	if (status === "connected") return null;

	return (
		<div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-lg bg-card/95 px-3 py-2 text-xs shadow-lg ring-1 ring-border backdrop-blur-sm animate-in slide-in-from-bottom-2 fade-in">
			<Icon className={cn("size-3.5", config.color, config.pulse && "animate-spin")} />
			<span className={cn("font-medium", config.color)}>{config.label}</span>
		</div>
	);
});
