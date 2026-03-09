import { useCallback, useEffect, useRef } from "react";

export function useTypingIndicator(
	activeChatId: string | null,
	sendTyping: (chatId: string, isTyping: boolean) => void,
) {
	const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
	const isTypingRef = useRef(false);

	const startTyping = useCallback(() => {
		if (!activeChatId) return;

		if (!isTypingRef.current) {
			isTypingRef.current = true;
			sendTyping(activeChatId, true);
		}

		clearTimeout(typingTimeoutRef.current);
		typingTimeoutRef.current = setTimeout(() => {
			isTypingRef.current = false;
			if (activeChatId) sendTyping(activeChatId, false);
		}, 2000);
	}, [activeChatId, sendTyping]);

	const stopTyping = useCallback(() => {
		clearTimeout(typingTimeoutRef.current);
		if (isTypingRef.current && activeChatId) {
			isTypingRef.current = false;
			sendTyping(activeChatId, false);
		}
	}, [activeChatId, sendTyping]);

	useEffect(() => {
		return () => {
			clearTimeout(typingTimeoutRef.current);
			if (isTypingRef.current) {
				isTypingRef.current = false;
			}
		};
	}, [activeChatId]);

	return { startTyping, stopTyping };
}
