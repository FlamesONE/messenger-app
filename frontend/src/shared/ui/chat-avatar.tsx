import { memo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/components/ui/avatar";

const COLORS = [
	"bg-black text-white",
	"bg-gray-300 text-gray-600",
	"bg-gray-500 text-white",
	"bg-gray-700 text-gray-200",
	"bg-gray-200 text-gray-500",
	"bg-gray-400 text-white",
	"bg-gray-800 text-gray-300",
	"bg-gray-600 text-white",
	"bg-gray-100 text-gray-500",
	"bg-gray-900 text-gray-400",
	"bg-gray-950 text-gray-300",
	"bg-gray-350 text-white",
];

function hashColor(str: string): string {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		hash = str.charCodeAt(i) + ((hash << 5) - hash);
	}
	return COLORS[Math.abs(hash) % COLORS.length];
}

function getInitials(name: string): string {
	return name
		.split(" ")
		.map((w) => w[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();
}

interface ChatAvatarProps {
	name: string;
	avatarUrl?: string | null;
	size?: "sm" | "default" | "lg" | "xl";
	online?: boolean;
}

const SIZE_CLASSES = {
	sm: "size-7",
	default: "size-10",
	lg: "size-14",
	xl: "size-20",
};

const ONLINE_DOT_CLASSES = {
	sm: "size-2 border",
	default: "size-3 border-2",
	lg: "size-3.5 border-2",
	xl: "size-4 border-[3px]",
};

export const ChatAvatar = memo(function ChatAvatar({
	name,
	avatarUrl,
	size = "default",
	online,
}: ChatAvatarProps) {
	const colorClass = hashColor(name);
	const initials = getInitials(name || "?");

	const sizeClass = SIZE_CLASSES[size];
	const textSize = size === "sm" ? "text-[10px]" : size === "lg" ? "text-lg" : size === "xl" ? "text-2xl" : "text-xs";

	return (
		<div className="relative shrink-0">
			<div className={`${sizeClass} overflow-hidden rounded-full`}>
				{avatarUrl ? (
					<Avatar className={sizeClass}>
						<AvatarImage src={avatarUrl} alt={name} />
						<AvatarFallback className={`${colorClass} font-semibold ${textSize}`}>
							{initials}
						</AvatarFallback>
					</Avatar>
				) : (
					<div className={`flex size-full items-center justify-center ${colorClass}`}>
						<span className={`font-semibold ${textSize}`}>
							{initials}
						</span>
					</div>
				)}
			</div>
			{online && (
				<span
					className={`absolute bottom-0 right-0 rounded-full border-card bg-emerald-500 ${ONLINE_DOT_CLASSES[size]}`}
				/>
			)}
		</div>
	);
});
