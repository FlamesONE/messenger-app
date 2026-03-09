import { Loader2, SquarePen } from "lucide-react";
import { memo, useCallback } from "react";
import type { User } from "@/entities/user";
import { ChatAvatar } from "@/shared/ui/chat-avatar";

interface UserSearchResultsProps {
	users: User[];
	isLoading: boolean;
	onStartChat: (user: User) => void;
}

export const UserSearchResults = memo(function UserSearchResults({
	users,
	isLoading,
	onStartChat,
}: UserSearchResultsProps) {
	return (
		<div className="flex flex-col animate-in fade-in duration-200">
			<div className="px-4 py-2.5">
				<p className="text-[11px] font-semibold uppercase tracking-wider text-panel-muted">
					Пользователи
				</p>
			</div>

			{isLoading && (
				<div className="flex justify-center py-8">
					<Loader2 className="size-5 animate-spin text-panel-muted" />
				</div>
			)}

			{!isLoading && users.length === 0 && (
				<div className="py-8 text-center text-sm text-panel-muted">
					Никого не найдено
				</div>
			)}

			{users.map((u) => (
				<UserSearchItem key={u.id} user={u} onStartChat={onStartChat} />
			))}
		</div>
	);
});

interface UserSearchItemProps {
	user: User;
	onStartChat: (u: User) => void;
}

const UserSearchItem = memo(function UserSearchItem({
	user,
	onStartChat,
}: UserSearchItemProps) {
	const handleChat = useCallback(() => onStartChat(user), [onStartChat, user]);

	return (
		<button
			type="button"
			onClick={handleChat}
			className="group flex w-full items-center gap-3 px-3 py-2 transition-all hover:bg-panel-secondary/60 rounded-lg mx-2"
		>
			<ChatAvatar name={user.displayName} avatarUrl={user.avatarUrl} size="default" />
			<div className="min-w-0 flex-1 text-left">
				<p className="truncate text-sm font-medium">{user.displayName}</p>
				<p className="truncate text-xs text-panel-muted">@{user.username}</p>
			</div>
			<SquarePen className="size-4 text-panel-muted opacity-0 transition-opacity group-hover:opacity-100" />
		</button>
	);
});
