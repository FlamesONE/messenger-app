import { Paperclip, SendHorizonal, Smile } from "lucide-react";
import { type KeyboardEvent, useCallback, useRef, useState } from "react";
import { useChatStore } from "@/entities/chat";
import { useSendMessage } from "@/entities/message";
import { cn } from "@/shared/lib/utils";

export function MessageInput() {
	const [text, setText] = useState("");
	const sendMessage = useSendMessage();
	const activeChatId = useChatStore((s) => s.activeChatId);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	const resetHeight = useCallback(() => {
		if (textareaRef.current) {
			textareaRef.current.style.height = "auto";
		}
	}, []);

	const handleSubmit = useCallback(
		async (e?: React.FormEvent) => {
			e?.preventDefault();
			if (!text.trim() || !activeChatId || sendMessage.isPending) return;

			const content = text.trim();
			setText("");
			resetHeight();

			await sendMessage.mutateAsync({ chatId: activeChatId, content });
			textareaRef.current?.focus();
		},
		[text, activeChatId, sendMessage, resetHeight],
	);

	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
			if (e.key === "Enter" && !e.shiftKey) {
				e.preventDefault();
				handleSubmit();
			}
		},
		[handleSubmit],
	);

	const autoResize = useCallback(() => {
		const el = textareaRef.current;
		if (!el) return;
		el.style.height = "auto";
		el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
	}, []);

	const hasText = text.trim().length > 0;

	return (
		<form
			onSubmit={handleSubmit}
			className="flex items-end gap-1.5 bg-card px-3 py-2.5 border-t border-border"
		>
			<button
				type="button"
				className="flex shrink-0 items-center justify-center rounded-full p-2 text-muted-foreground hover:text-foreground transition-colors"
			>
				<Paperclip className="size-5" />
			</button>

			<div className="relative flex-1">
				<textarea
					ref={textareaRef}
					value={text}
					onChange={(e) => {
						setText(e.target.value);
						autoResize();
					}}
					onKeyDown={handleKeyDown}
					placeholder="Сообщение..."
					rows={1}
					className="w-full resize-none rounded-2xl bg-secondary px-4 py-2.5 pr-10 text-sm leading-snug outline-none placeholder:text-muted-foreground"
					style={{ maxHeight: 140 }}
				/>
				<button
					type="button"
					className="absolute right-2.5 bottom-2 text-muted-foreground hover:text-foreground transition-colors"
				>
					<Smile className="size-5" />
				</button>
			</div>

			<button
				type="submit"
				disabled={!hasText || sendMessage.isPending}
				className={cn(
					"flex shrink-0 items-center justify-center rounded-full p-2 transition-all",
					hasText ? "text-primary hover:bg-primary/10" : "text-muted-foreground/40 cursor-default",
				)}
			>
				<SendHorizonal className="size-5" />
			</button>
		</form>
	);
}
