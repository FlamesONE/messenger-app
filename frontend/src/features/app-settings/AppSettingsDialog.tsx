import { Bell, Globe, Volume2 } from "lucide-react";
import { memo, useCallback, useState } from "react";
import { showError, showSuccess } from "@/shared/ui/custom-toast";
import { refreshApiClient } from "@/shared/api/client";
import { useAppSettings } from "@/shared/lib/app-settings-store";
import { requestNotificationPermission } from "@/shared/lib/notifications";
import { isTauri } from "@/shared/lib/platform";
import { AppDrawer } from "@/shared/ui/app-drawer";
import { Button } from "@/shared/ui/components/ui/button";
import { Input } from "@/shared/ui/components/ui/input";
import { Label } from "@/shared/ui/components/ui/label";
import { Switch } from "@/shared/ui/components/ui/switch";

interface Props {
	open: boolean;
	onClose: () => void;
}

export const AppSettingsDialog = memo(function AppSettingsDialog({ open, onClose }: Props) {
	const notificationsEnabled = useAppSettings((s) => s.notificationsEnabled);
	const setNotificationsEnabled = useAppSettings((s) => s.setNotificationsEnabled);
	const soundEnabled = useAppSettings((s) => s.soundEnabled);
	const setSoundEnabled = useAppSettings((s) => s.setSoundEnabled);
	const serverUrl = useAppSettings((s) => s.serverUrl);
	const setServerUrl = useAppSettings((s) => s.setServerUrl);

	const [urlDraft, setUrlDraft] = useState(serverUrl);
	const [urlSaved, setUrlSaved] = useState(false);

	const handleToggleNotifications = useCallback(
		async (enabled: boolean) => {
			if (enabled) {
				const granted = await requestNotificationPermission();
				if (!granted) {
					showError("Разрешение на уведомления не получено");
					return;
				}
			}
			setNotificationsEnabled(enabled);
		},
		[setNotificationsEnabled],
	);

	const handleSaveUrl = useCallback(() => {
		const cleaned = urlDraft.trim();
		if (cleaned && !/^https?:\/\/.+/.test(cleaned)) {
			showError("URL должен начинаться с http:// или https://");
			return;
		}
		setServerUrl(cleaned);
		refreshApiClient();
		setUrlSaved(true);
		setTimeout(() => setUrlSaved(false), 2000);
		if (cleaned !== serverUrl) {
			showSuccess("Адрес сервера обновлён. Переподключение...");
			setTimeout(() => window.location.reload(), 1000);
		}
	}, [urlDraft, serverUrl, setServerUrl]);

	const handleOpenChange = useCallback(
		(v: boolean) => { if (!v) onClose(); },
		[onClose],
	);

	return (
		<AppDrawer
			open={open}
			onOpenChange={handleOpenChange}
			title="Настройки приложения"
		>
			<div className="flex flex-col gap-6">
				{/* Notifications section */}
				<section className="flex flex-col gap-3">
					<h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
						Уведомления
					</h3>

					<SettingRow
						icon={<Bell className="size-4" />}
						label="Push-уведомления"
						description={isTauri ? "Системные уведомления ОС" : "Уведомления в браузере"}
					>
						<Switch
							checked={notificationsEnabled}
							onCheckedChange={handleToggleNotifications}
						/>
					</SettingRow>

					<SettingRow
						icon={<Volume2 className="size-4" />}
						label="Звук уведомлений"
						description="Звуковой сигнал при новом сообщении"
					>
						<Switch
							checked={soundEnabled}
							onCheckedChange={setSoundEnabled}
						/>
					</SettingRow>
				</section>

				{/* Server section */}
				<section className="flex flex-col gap-3">
					<h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
						Подключение
					</h3>

					<div className="flex flex-col gap-2">
						<div className="flex items-center gap-2 text-sm">
							<Globe className="size-4 text-muted-foreground" />
							<span>Адрес сервера</span>
						</div>
						<p className="text-[11px] text-muted-foreground/60 -mt-1">
							{isTauri
								? "URL сервера Fasty для подключения"
								: "Оставьте пустым для текущего хоста"}
						</p>
						<div className="flex gap-2">
							<Input
								value={urlDraft}
								onChange={(e) => {
									setUrlDraft(e.target.value);
									setUrlSaved(false);
								}}
								placeholder="https://fasty.example.com"
								className="flex-1"
							/>
							<Button
								variant={urlSaved ? "ghost" : "default"}
								size="sm"
								onClick={handleSaveUrl}
								className="rounded-xl shrink-0"
							>
								{urlSaved ? "Сохранено" : "Сохранить"}
							</Button>
						</div>
					</div>
				</section>
			</div>
		</AppDrawer>
	);
});

function SettingRow({
	icon,
	label,
	description,
	children,
}: {
	icon: React.ReactNode;
	label: string;
	description?: string;
	children: React.ReactNode;
}) {
	return (
		<div className="flex items-center gap-3">
			<span className="text-muted-foreground">{icon}</span>
			<div className="flex-1 min-w-0">
				<Label className="text-sm">{label}</Label>
				{description && (
					<p className="text-[11px] text-muted-foreground/60">{description}</p>
				)}
			</div>
			{children}
		</div>
	);
}
