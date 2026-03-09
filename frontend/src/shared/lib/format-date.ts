import { format, isToday, isYesterday } from "date-fns";
import { ru } from "date-fns/locale";

export function formatMessageTime(date: Date | string): string {
	const d = new Date(date);

	if (isToday(d)) {
		return format(d, "HH:mm", { locale: ru });
	}
	if (isYesterday(d)) return "Вчера";

	const now = new Date();
	const diffDays = Math.floor((now.getTime() - d.getTime()) / 86_400_000);
	if (diffDays < 7) {
		return format(d, "EEE", { locale: ru });
	}
	return format(d, "dd.MM", { locale: ru });
}

export function formatFileSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} Б`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
}

export function formatFullDate(date: Date | string): string {
	return format(new Date(date), "d MMMM yyyy", { locale: ru });
}

export function formatLastSeen(date: Date | string): string {
	const d = new Date(date);
	if (isToday(d)) {
		return `был(а) в ${format(d, "HH:mm", { locale: ru })}`;
	}
	return `был(а) ${format(d, "dd.MM.yyyy", { locale: ru })}`;
}
