export function viewersLabel(count: number): string {
	if (count === 1) return "просмотр";
	if (count >= 2 && count <= 4) return "просмотра";
	return "просмотров";
}
