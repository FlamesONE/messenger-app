import { Loader2, Search } from "lucide-react";
import { memo, useCallback, useState } from "react";
import { showSuccess } from "@/shared/ui/custom-toast";
import { useAddMember } from "@/entities/chat";
import { useSearchUsers } from "@/entities/user";
import { useDebounce } from "@uidotdev/usehooks";
import { ChatAvatar } from "@/shared/ui/chat-avatar";
import { Button } from "@/shared/ui/components/ui/button";
import { Input } from "@/shared/ui/components/ui/input";
import { ErrorAlert } from "@/shared/ui/error-alert";
import { AppDrawer } from "@/shared/ui/app-drawer";

interface Props {
	chatId: string;
	open: boolean;
	onClose: () => void;
}

export const AddMemberDialog = memo(function AddMemberDialog({ chatId, open, onClose }: Props) {
	const [searchQuery, setSearchQuery] = useState("");

	const handleSuccess = useCallback(() => {
		setSearchQuery("");
		onClose();
		showSuccess("Участник добавлен");
	}, [onClose]);

	const addMember = useAddMember(chatId, handleSuccess);
	const debouncedSearch = useDebounce(searchQuery, 300);
	const { data: searchResults = [], isLoading: isSearching } = useSearchUsers(debouncedSearch);

	const handleAddUser = useCallback(
		(userId: string) => {
			addMember.mutate({ userId });
		},
		[addMember],
	);

	const handleOpenChange = useCallback(
		(v: boolean) => {
			if (!v) {
				onClose();
				setSearchQuery("");
			}
		},
		[onClose],
	);

	return (
		<AppDrawer
			open={open}
			onOpenChange={handleOpenChange}
			title="Добавить участника"
			variant="surface"
		>
			<div className="flex flex-col gap-4">
				<ErrorAlert error={addMember.error} />

				<div className="relative">
					<Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder="Поиск по имени или @username..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-9"
						autoFocus
					/>
				</div>

				<div className="max-h-72 overflow-y-auto rounded-xl border border-border">
					{isSearching && searchQuery && (
						<div className="flex items-center justify-center py-6">
							<Loader2 className="size-5 animate-spin text-muted-foreground" />
						</div>
					)}

					{!isSearching && searchQuery && searchResults.length === 0 && (
						<div className="py-6 text-center text-sm text-muted-foreground">
							Пользователи не найдены
						</div>
					)}

					{!searchQuery && (
						<div className="py-6 text-center text-sm text-muted-foreground">
							Начните вводить имя или @username
						</div>
					)}

					{searchResults.map((user) => (
						<button
							key={user.id}
							type="button"
							onClick={() => handleAddUser(user.id)}
							disabled={addMember.isPending}
							className="flex w-full items-center gap-3 px-3 py-2.5 transition-colors hover:bg-secondary/60 disabled:opacity-50"
						>
							<ChatAvatar name={user.displayName} avatarUrl={user.avatarUrl} size="sm" />
							<div className="min-w-0 flex-1 text-left">
								<p className="truncate text-sm font-medium">{user.displayName}</p>
								<p className="truncate text-xs text-muted-foreground">@{user.username}</p>
							</div>
							<Button variant="secondary" size="xs" className="shrink-0">
								Добавить
							</Button>
						</button>
					))}
				</div>
			</div>
		</AppDrawer>
	);
});
