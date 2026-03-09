import { MessageCircle } from "lucide-react";
import { memo } from "react";

export const EmptyState = memo(function EmptyState() {
	return (
		<div className="chat-surface flex flex-1 items-center justify-center h-full">
			<div className="text-center animate-in fade-in zoom-in-95 duration-300">
				<div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl border border-surface-border">
					<MessageCircle className="size-7 text-surface-muted" />
				</div>
				<h3 className="text-sm font-semibold text-foreground">Выберите чат</h3>
				<p className="mt-1 text-sm text-surface-muted">Выберите чат из списка или создайте новый</p>
			</div>
		</div>
	);
});
