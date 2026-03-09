import { useQueryClient } from "@tanstack/react-query";
import { memo, useMemo } from "react";
import { chatKeys } from "@/entities/chat";
import type { ChatMember } from "@/entities/chat";
import { useTypingUsers } from "@/entities/message";


interface TypingIndicatorProps {
	chatId: string | null;
}

export const TypingIndicator = memo(function TypingIndicator({ chatId }: TypingIndicatorProps) {
	const typingUserIds = useTypingUsers(chatId ?? undefined);
	const qc = useQueryClient();

	const label = useMemo(() => {
		if (typingUserIds.length === 0) return null;

		const members = qc.getQueryData<ChatMember[]>(chatKeys.members(chatId || ""));

		const names = typingUserIds
			.map((id) => {
				const member = members?.find((m) => m.id === id);
				return member?.displayName?.split(" ")[0] || "Кто-то";
			})
			.slice(0, 3);

		if (names.length === 1) return `${names[0]} печатает`;
		if (names.length === 2) return `${names[0]} и ${names[1]} печатают`;
		return `${names[0]}, ${names[1]} и ещё ${typingUserIds.length - 2} печатают`;
	}, [typingUserIds, qc, chatId]);

	if (!label) return null;

	return (
		<div className="absolute inset-x-0 bottom-full z-10 pointer-events-none">
			<div className="mx-3 mb-1 inline-flex items-center gap-2 rounded-full bg-surface-elevated/95 backdrop-blur-sm border border-surface-border/60 px-3 py-1 text-xs text-muted-foreground shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-200">
				<TypingDots />
				<span>{label}</span>
			</div>
		</div>
	);
});

const TypingDots = memo(function TypingDots() {
	return (
		<span className="inline-flex items-center gap-[3px]">
			<span className="size-[5px] rounded-full bg-muted-foreground animate-bounce [animation-delay:0ms]" />
			<span className="size-[5px] rounded-full bg-muted-foreground animate-bounce [animation-delay:150ms]" />
			<span className="size-[5px] rounded-full bg-muted-foreground animate-bounce [animation-delay:300ms]" />
		</span>
	);
});
