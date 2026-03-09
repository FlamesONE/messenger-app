import { Globe } from "lucide-react";
import { useCallback, useState } from "react";
import { useAppSettings } from "@/shared/lib/app-settings-store";
import { refreshApiClient } from "@/shared/api/client";
import { isTauri } from "@/shared/lib/platform";

export function ServerUrlPicker() {
	const serverUrl = useAppSettings((s) => s.serverUrl);
	const setServerUrl = useAppSettings((s) => s.setServerUrl);
	const [editing, setEditing] = useState(false);
	const [draft, setDraft] = useState(serverUrl);

	const handleSave = useCallback(() => {
		const cleaned = draft.trim();
		if (cleaned && !/^https?:\/\/.+/.test(cleaned)) return;
		setServerUrl(cleaned);
		refreshApiClient();
		setEditing(false);
	}, [draft, setServerUrl]);

	const displayUrl = serverUrl || (isTauri ? "не задан" : window.location.host);

	if (!editing) {
		return (
			<button
				type="button"
				onClick={() => { setDraft(serverUrl); setEditing(true); }}
				className="mt-6 flex w-full items-center justify-center gap-1.5 text-[11px] text-muted-foreground/50 transition-colors hover:text-muted-foreground"
			>
				<Globe className="size-3" />
				<span>Сервер: {displayUrl}</span>
			</button>
		);
	}

	return (
		<div className="mt-6 flex flex-col gap-2 rounded-xl border border-border/60 bg-muted/30 p-3">
			<label className="text-[11px] font-medium text-muted-foreground">
				Адрес сервера
			</label>
			<input
				value={draft}
				onChange={(e) => setDraft(e.target.value)}
				placeholder="https://fasty.flute-cms.com"
				className="h-9 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
				onKeyDown={(e) => e.key === "Enter" && handleSave()}
			/>
			<div className="flex justify-end gap-2">
				<button
					type="button"
					onClick={() => setEditing(false)}
					className="rounded-lg px-3 py-1.5 text-[12px] text-muted-foreground hover:bg-muted"
				>
					Отмена
				</button>
				<button
					type="button"
					onClick={handleSave}
					className="rounded-lg bg-primary px-3 py-1.5 text-[12px] text-primary-foreground hover:bg-primary/90"
				>
					Сохранить
				</button>
			</div>
		</div>
	);
}
