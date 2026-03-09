import { ArrowDown } from "lucide-react";
import { memo } from "react";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/components/ui/button";
import { Tip } from "@/shared/ui/tip";

interface ScrollToBottomProps {
	visible: boolean;
	onClick: () => void;
	unreadCount?: number;
}

export const ScrollToBottom = memo(function ScrollToBottom({
	visible,
	onClick,
	unreadCount,
}: ScrollToBottomProps) {
	return (
		<div
			className={cn(
				"fixed bottom-20 right-5 z-10 transition-all duration-200",
				visible
					? "translate-y-0 opacity-100"
					: "pointer-events-none translate-y-2 opacity-0",
			)}
		>
			<Tip label="К последним сообщениям" side="left">
				<Button
					size="icon"
					onClick={onClick}
					className="relative size-9 rounded-full bg-surface-elevated text-foreground border border-surface-border hover:bg-surface-elevated/80 shadow-sm"
				>
					<ArrowDown className="size-4" />
					{unreadCount && unreadCount > 0 ? (
						<span className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
							{unreadCount > 99 ? "99+" : unreadCount}
						</span>
					) : null}
				</Button>
			</Tip>
		</div>
	);
});
