import { memo, useCallback } from "react";
import type { Message } from "@/entities/message";
import { formatMessageTime } from "@/shared/lib/format-date";

function highlightMatch(text: string, query: string): React.ReactNode {
	if (!query) return text;
	const idx = text.toLowerCase().indexOf(query.toLowerCase());
	if (idx === -1) return text;
	const before = text.slice(0, idx);
	const match = text.slice(idx, idx + query.length);
	const after = text.slice(idx + query.length);
	return (
		<>
			{before}
			<mark className="bg-primary/25 text-inherit rounded-sm px-px">{match}</mark>
			{after}
		</>
	);
}

interface SearchResultItemProps {
	message: Message;
	query: string;
	onClick: (msg: Message) => void;
}

export const SearchResultItem = memo(function SearchResultItem({
	message,
	query,
	onClick,
}: SearchResultItemProps) {
	const handleClick = useCallback(() => onClick(message), [onClick, message]);

	const snippetStart = Math.max(0, message.content.toLowerCase().indexOf(query.toLowerCase()) - 40);
	const snippet = (snippetStart > 0 ? "..." : "") + message.content.slice(snippetStart, snippetStart + 120);

	return (
		<button
			type="button"
			onClick={handleClick}
			className="flex w-full items-start gap-3 px-4 py-2.5 text-left transition-colors hover:bg-accent/50 border-b border-border/30 last:border-b-0"
		>
			<div className="min-w-0 flex-1">
				<p className="text-[13px] leading-snug line-clamp-2">
					{highlightMatch(snippet, query)}
				</p>
				<span className="mt-0.5 text-[11px] text-muted-foreground">
					{formatMessageTime(message.createdAt)}
				</span>
			</div>
		</button>
	);
});
