import { Hand } from "lucide-react";
import { memo } from "react";
import { ChatAvatar } from "@/shared/ui/chat-avatar";

interface EmptyChatProps {
	chatName: string;
	avatarUrl?: string | null;
	isGroup?: boolean;
}

export const EmptyChat = memo(function EmptyChat({ chatName, avatarUrl, isGroup }: EmptyChatProps) {
	return (
		<div className="flex flex-1 items-center justify-center">
			<div className="flex flex-col items-center gap-3 animate-in fade-in zoom-in-95 duration-300">
				<ChatAvatar name={chatName} avatarUrl={avatarUrl} size="lg" />
				<div className="text-center">
					<h3 className="text-sm font-semibold">{chatName}</h3>
					<p className="mt-1 text-xs text-muted-foreground">
						{isGroup
							? "Здесь пока пусто. Напишите первое сообщение!"
							: "Начните общение — отправьте первое сообщение"}
					</p>
				</div>
				<div className="mt-1 flex items-center gap-1.5 text-muted-foreground">
					<Hand className="size-4" />
					<span className="text-xs">Скажите привет!</span>
				</div>
			</div>
		</div>
	);
});
