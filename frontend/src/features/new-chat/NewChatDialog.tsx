import { Loader2, X } from "lucide-react";
import { memo, useCallback, useMemo, useState } from "react";
import { showError, showWarning } from "@/shared/ui/custom-toast";
import { useChatStore, useCreateChat } from "@/entities/chat";
import type { User as UserType } from "@/entities/user";
import { useAuthStore, useSearchUsers } from "@/entities/user";
import { useDebounce } from "@uidotdev/usehooks";
import { ChatAvatar } from "@/shared/ui/chat-avatar";
import { Button } from "@/shared/ui/components/ui/button";
import { Input } from "@/shared/ui/components/ui/input";
import { ErrorAlert } from "@/shared/ui/error-alert";
import { AppDrawer } from "@/shared/ui/app-drawer";
import { ChooseStep } from "./ChooseStep";
import { SearchStep } from "./SearchStep";
import type { NewChatStep } from "./ChooseStep";

interface Props {
	open: boolean;
	onClose: () => void;
}

export const NewChatDialog = memo(function NewChatDialog({ open, onClose }: Props) {
	const setPendingDmUser = useChatStore((s) => s.setPendingDmUser);
	const setActiveChat = useChatStore((s) => s.setActiveChat);
	const createChat = useCreateChat();
	const currentUserId = useAuthStore((s) => s.user?.id);

	const [step, setStep] = useState<NewChatStep>("choose");
	const [groupName, setGroupName] = useState("");
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedUsers, setSelectedUsers] = useState<UserType[]>([]);

	const debouncedSearch = useDebounce(searchQuery, 300);
	const { data: searchResults = [], isLoading: isSearching } = useSearchUsers(
		step !== "choose" ? debouncedSearch : "",
	);

	const filteredResults = useMemo(() => {
		return searchResults.filter(
			(u) => u.id !== currentUserId && !selectedUsers.some((s) => s.id === u.id),
		);
	}, [searchResults, currentUserId, selectedUsers]);

	const reset = useCallback(() => {
		setStep("choose");
		setGroupName("");
		setSearchQuery("");
		setSelectedUsers([]);
	}, []);

	const handleSelectUserPersonal = useCallback(
		(user: UserType) => {
			setPendingDmUser(user);
			onClose();
			reset();
		},
		[setPendingDmUser, onClose, reset],
	);

	const handleSelectUserGroup = useCallback(
		(user: UserType) => {
			setSelectedUsers((prev) => [...prev, user]);
			setSearchQuery("");
		},
		[],
	);

	const handleRemoveUser = useCallback((userId: string) => {
		setSelectedUsers((prev) => prev.filter((u) => u.id !== userId));
	}, []);

	const handleCreateGroup = useCallback(async () => {
		if (selectedUsers.length === 0) {
			showWarning("Добавьте хотя бы одного участника");
			return;
		}
		try {
			const chat = await createChat.mutateAsync({
				name: groupName || undefined,
				isGroup: true,
				memberIds: selectedUsers.map((u) => u.id),
			});
			setActiveChat(chat.id);
			onClose();
			reset();
		} catch {
			showError("Не удалось создать группу");
		}
	}, [selectedUsers, groupName, createChat, setActiveChat, onClose, reset]);

	const handleOpenChange = useCallback(
		(v: boolean) => {
			if (!v) {
				onClose();
				reset();
			}
		},
		[onClose, reset],
	);

	const handleBack = useCallback(() => {
		if (step !== "choose") {
			setStep("choose");
			setSearchQuery("");
			setSelectedUsers([]);
			setGroupName("");
		}
	}, [step]);

	const title = step === "choose"
		? "Новый чат"
		: step === "personal"
			? "Личное сообщение"
			: "Новая группа";

	return (
		<AppDrawer
			open={open}
			onOpenChange={handleOpenChange}
			title={title}
			variant="panel"
			onBack={step !== "choose" ? handleBack : undefined}
			footer={
				step === "group" ? (
					<Button
						onClick={handleCreateGroup}
						disabled={createChat.isPending || selectedUsers.length === 0}
						className="w-full h-10 rounded-xl font-medium"
					>
						{createChat.isPending ? (
							<Loader2 className="size-4 animate-spin" />
						) : (
							`Создать группу${selectedUsers.length > 0 ? ` · ${selectedUsers.length}` : ""}`
						)}
					</Button>
				) : undefined
			}
		>
			{step === "choose" && <ChooseStep onChoose={setStep} />}

			{step === "personal" && (
				<SearchStep
					searchQuery={searchQuery}
					onSearchChange={setSearchQuery}
					isSearching={isSearching}
					results={filteredResults}
					placeholder="Имя или @username..."
					emptyHint="Начните вводить для поиска"
					onSelect={handleSelectUserPersonal}
				/>
			)}

			{step === "group" && (
				<div className="flex flex-col gap-4">
					<ErrorAlert error={createChat.error} />

					<Input
						placeholder="Название группы (необязательно)"
						value={groupName}
						onChange={(e) => setGroupName(e.target.value)}
						className="rounded-xl"
					/>

					{selectedUsers.length > 0 && (
						<div className="flex flex-wrap gap-1.5">
							{selectedUsers.map((u) => (
								<span
									key={u.id}
									className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 pl-1 pr-2 py-0.5 text-xs font-medium text-primary"
								>
									<ChatAvatar name={u.displayName} avatarUrl={u.avatarUrl} size="sm" />
									<span className="truncate max-w-[100px]">{u.displayName}</span>
									<button
										type="button"
										onClick={() => handleRemoveUser(u.id)}
										className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-primary/25"
									>
										<X className="size-3" />
									</button>
								</span>
							))}
						</div>
					)}

					<SearchStep
						searchQuery={searchQuery}
						onSearchChange={setSearchQuery}
						isSearching={isSearching}
						results={filteredResults}
						placeholder="Добавить участников..."
						emptyHint="Введите имя или @username"
						onSelect={handleSelectUserGroup}
						compact
					/>
				</div>
			)}
		</AppDrawer>
	);
});
