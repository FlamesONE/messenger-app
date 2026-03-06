import { CheckCheck } from "lucide-react";
import { memo } from "react";
import type { Message } from "@/entities/message/model/types";
import { formatMessageTime } from "@/shared/lib/format-date";
import { cn } from "@/shared/lib/utils";

interface MessageBubbleProps {
	message: Message;
	isMine: boolean;
	showTail: boolean;
}

export const MessageBubble = memo(function MessageBubble({
	message,
	isMine,
	showTail,
}: MessageBubbleProps) {
	if (message.deletedAt) {
		return (
			<div className={cn("flex", isMine ? "justify-end" : "justify-start")}>
				<div className="rounded-2xl bg-muted/50 px-3 py-1.5 text-xs italic text-muted-foreground">
					Сообщение удалено
				</div>
			</div>
		);
	}

	return (
		<div className={cn("flex", isMine ? "justify-end" : "justify-start")}>
			<div
				className={cn(
					"relative max-w-[70%] rounded-2xl px-3 py-1.5 text-sm shadow-sm",
					isMine ? "bg-tg-bubble-out text-card-foreground" : "bg-tg-bubble-in text-card-foreground",
					isMine && showTail && "rounded-br-sm",
					!isMine && showTail && "rounded-bl-sm",
				)}
			>
				{/* Media */}
				{message.media && message.media.length > 0 && (
					<div className="mb-1.5 flex flex-col gap-1">
						{message.media.map((m) =>
							m.type.startsWith("image/") ? (
								<img
									key={m.key}
									src={m.url}
									alt={m.name}
									className="max-w-full rounded-lg max-h-64 object-cover"
									loading="lazy"
								/>
							) : (
								<a
									key={m.key}
									href={m.url}
									target="_blank"
									rel="noopener noreferrer"
									className="text-xs text-primary underline"
								>
									{m.name}
								</a>
							),
						)}
					</div>
				)}

				{/* Content + time */}
				<div className="flex items-end gap-1.5">
					<p className="whitespace-pre-wrap break-words leading-[1.35]">{message.content}</p>
					<span className="ml-auto flex shrink-0 items-center gap-0.5 self-end pb-px">
						<time className="text-[10px] leading-none text-muted-foreground/70">
							{formatMessageTime(message.createdAt)}
						</time>
						{isMine && <CheckCheck className="size-3.5 text-primary/70" />}
					</span>
				</div>
			</div>
		</div>
	);
});
