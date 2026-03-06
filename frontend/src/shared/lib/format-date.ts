export function formatMessageTime(date: Date | string): string {
	const d = new Date(date);
	const now = new Date();
	const diff = now.getTime() - d.getTime();
	const days = Math.floor(diff / (1000 * 60 * 60 * 24));

	if (days === 0) {
		return d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
	}
	if (days === 1) return "Вчера";
	if (days < 7) {
		return d.toLocaleDateString("ru-RU", { weekday: "short" });
	}
	return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" });
}

export function formatFullDate(date: Date | string): string {
	return new Date(date).toLocaleDateString("ru-RU", {
		day: "numeric",
		month: "long",
		year: "numeric",
	});
}
