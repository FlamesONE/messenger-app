import { Bell, Volume2, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useAppSettings } from "@/shared/lib/app-settings-store";
import { requestNotificationPermission } from "@/shared/lib/notifications";
import { Switch } from "@/shared/ui/components/ui/switch";

export function NotificationBanner() {
	const dismissed = useAppSettings((s) => s.notificationBannerDismissed);
	const setDismissed = useAppSettings((s) => s.setNotificationBannerDismissed);
	const notificationsEnabled = useAppSettings((s) => s.notificationsEnabled);
	const setNotificationsEnabled = useAppSettings((s) => s.setNotificationsEnabled);
	const soundEnabled = useAppSettings((s) => s.soundEnabled);
	const setSoundEnabled = useAppSettings((s) => s.setSoundEnabled);

	const [visible, setVisible] = useState(false);
	const [mounted, setMounted] = useState(false);
	const [granted, setGranted] = useState(false);

	useEffect(() => {
		if (dismissed) return;
		if (!("Notification" in window)) return;

		const perm = Notification.permission;
		if (perm === "granted") {
			setGranted(true);
			if (notificationsEnabled) return;
		}

		// Auto-request permission on mount
		if (perm === "default") {
			requestNotificationPermission().then((ok) => {
				if (ok) {
					setNotificationsEnabled(true);
					setGranted(true);
					setDismissed(true);
					return;
				}
				// If denied or dismissed, show banner
				setMounted(true);
				setTimeout(() => setVisible(true), 150);
			});
			return;
		}

		setMounted(true);
		const timer = setTimeout(() => setVisible(true), 150);
		return () => clearTimeout(timer);
	}, [dismissed, notificationsEnabled, setNotificationsEnabled, setDismissed]);

	const handleDismiss = useCallback(() => {
		setVisible(false);
		setTimeout(() => {
			setMounted(false);
			setDismissed(true);
		}, 300);
	}, [setDismissed]);

	const handleEnable = useCallback(async () => {
		const ok = await requestNotificationPermission();
		if (ok) {
			setNotificationsEnabled(true);
			setGranted(true);
			handleDismiss();
		}
	}, [setNotificationsEnabled, handleDismiss]);

	if (!mounted || dismissed) return null;

	return (
		<div className="fixed top-0 left-0 right-0 z-[9999] flex justify-center pointer-events-none px-4 pt-4">
			<div
				className={`
					pointer-events-auto w-[340px]
					rounded-2xl border border-surface-border
					bg-surface-elevated
					shadow-lg shadow-black/8
					transition-all duration-300 ease-out
					${visible
						? "translate-y-0 opacity-100"
						: "-translate-y-3 opacity-0"
					}
				`}
			>
				<div className="px-4 py-3 flex flex-col gap-3">
					{/* Header row */}
					<div className="flex items-center gap-2.5">
						<div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
							<Bell className="size-4" />
						</div>
						<p className="flex-1 text-[13px] font-semibold leading-snug">
							Включить уведомления?
						</p>
						<button
							type="button"
							onClick={handleDismiss}
							className="shrink-0 rounded-md p-0.5 text-surface-muted transition-colors hover:text-foreground"
						>
							<X className="size-3.5" />
						</button>
					</div>

					{/* Sound toggle */}
					<div className="flex items-center gap-2.5">
						<div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-surface text-surface-muted">
							<Volume2 className="size-4" />
						</div>
						<span className="flex-1 text-[13px]">Звук</span>
						<Switch
							checked={soundEnabled}
							onCheckedChange={setSoundEnabled}
						/>
					</div>

					{/* Action */}
					{!granted && (
						<button
							type="button"
							onClick={handleEnable}
							className="w-full rounded-xl bg-primary px-3 py-2 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90 active:scale-[0.98]"
						>
							Разрешить
						</button>
					)}
				</div>
			</div>
		</div>
	);
}
