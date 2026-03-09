import { Crown, Link2, Loader2, Shield, UserPlus, Users } from "lucide-react";
import { memo, useCallback, useMemo, useState } from "react";
import { showError, showSuccess } from "@/shared/ui/custom-toast";
import { useChatMembers, useGenerateInviteLink } from "@/entities/chat";
import type { Chat, ChatMember } from "@/entities/chat";
import type { User } from "@/entities/user";
import { useAuthStore } from "@/entities/user";
import { usePresenceStore } from "@/entities/user";
import { ChatAvatar } from "@/shared/ui/chat-avatar";
import { AppDrawer } from "@/shared/ui/app-drawer";
import { Button } from "@/shared/ui/components/ui/button";
import { AddMemberDialog } from "@/features/chat-list/AddMemberDialog";
import { UserProfileDialog } from "./UserProfileDialog";

interface Props {
	chat: Chat;
	open: boolean;
	onClose: () => void;
}

const ROLE_ICON: Record<string, typeof Crown> = {
	owner: Crown,
	admin: Shield,
};

const ROLE_LABEL: Record<string, string> = {
	owner: "Создатель",
	admin: "Админ",
};

export const GroupProfileDrawer = memo(function GroupProfileDrawer({ chat, open, onClose }: Props) {
	const { data: members = [], isLoading } = useChatMembers(open ? chat.id : null);
	const currentUserId = useAuthStore((s) => s.user?.id);
	const generateInvite = useGenerateInviteLink(chat.id);
	const [addMemberOpen, setAddMemberOpen] = useState(false);
	const [selectedMember, setSelectedMember] = useState<User | null>(null);

	const handleOpenChange = useCallback(
		(v: boolean) => { if (!v) onClose(); },
		[onClose],
	);

	const sortedMembers = useMemo(() => {
		const order: Record<string, number> = { owner: 0, admin: 1, member: 2 };
		return [...members].sort(
			(a, b) => (order[a.role] ?? 3) - (order[b.role] ?? 3),
		);
	}, [members]);

	const onlineCount = useMemo(() => {
		const state = usePresenceStore.getState();
		return members.filter((m) => state.isOnline(m.id)).length;
	}, [members]);

	const handleCopyInvite = useCallback(async () => {
		try {
			const result = await generateInvite.mutateAsync();
			const link = `${window.location.origin}/join/${result.inviteCode}`;
			await navigator.clipboard.writeText(link);
			showSuccess("Ссылка-приглашение скопирована");
		} catch {
			showError("Не удалось получить ссылку");
		}
	}, [generateInvite]);

	const createdDate = useMemo(() => {
		return new Date(chat.createdAt).toLocaleDateString("ru-RU", {
			day: "numeric",
			month: "long",
			year: "numeric",
		});
	}, [chat.createdAt]);

	return (
		<>
			<AppDrawer
				open={open}
				onOpenChange={handleOpenChange}
				title="Группа"
				variant="surface"
			>
				{/* Hero */}
				<div className="relative flex flex-col items-center rounded-2xl bg-gradient-to-b from-primary/[0.06] to-transparent px-6 py-6 -mx-1">
					<ChatAvatar name={chat.name || "Группа"} size="xl" />
					<h2 className="mt-3.5 text-[17px] font-bold tracking-tight leading-tight text-center">
						{chat.name || "Группа"}
					</h2>
					<p className="mt-1 text-[11px] text-muted-foreground/70">
						{members.length} участников · {onlineCount} в сети · создана {createdDate}
					</p>
				</div>

				{/* Actions */}
				<div className="mt-4 grid grid-cols-2 gap-2">
					<Button
						variant="outline"
						className="h-10 gap-2 rounded-xl font-medium text-[13px]"
						onClick={() => setAddMemberOpen(true)}
					>
						<UserPlus className="size-4" />
						Добавить
					</Button>
					<Button
						variant="outline"
						className="h-10 gap-2 rounded-xl font-medium text-[13px]"
						onClick={handleCopyInvite}
						disabled={generateInvite.isPending}
					>
						{generateInvite.isPending ? (
							<Loader2 className="size-4 animate-spin" />
						) : (
							<Link2 className="size-4" />
						)}
						Пригласить
					</Button>
				</div>

				{/* Members */}
				<div className="mt-5">
					<div className="flex items-center gap-2 mb-2 px-1">
						<Users className="size-3.5 text-muted-foreground/50" />
						<span className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wider">
							Участники
						</span>
						<span className="text-[11px] text-muted-foreground/40">
							{members.length}
						</span>
					</div>

					{isLoading ? (
						<div className="flex items-center justify-center py-8">
							<Loader2 className="size-5 animate-spin text-muted-foreground/40" />
						</div>
					) : (
						<div className="flex flex-col gap-px rounded-xl overflow-hidden">
							{sortedMembers.map((member) => (
								<MemberRow
									key={member.id}
									member={member}
									isCurrentUser={member.id === currentUserId}
									onClick={() =>
										setSelectedMember({
											id: member.id,
											username: member.username,
											displayName: member.displayName,
											avatarUrl: member.avatarUrl,
											email: "",
										})
									}
								/>
							))}
						</div>
					)}
				</div>
			</AppDrawer>

			<AddMemberDialog
				chatId={chat.id}
				open={addMemberOpen}
				onClose={() => setAddMemberOpen(false)}
			/>

			<UserProfileDialog
				user={selectedMember}
				open={!!selectedMember}
				onClose={() => setSelectedMember(null)}
			/>
		</>
	);
});

const MemberRow = memo(function MemberRow({
	member,
	isCurrentUser,
	onClick,
}: {
	member: ChatMember;
	isCurrentUser: boolean;
	onClick: () => void;
}) {
	const isOnline = usePresenceStore((s) => s.isOnline(member.id));
	const RoleIcon = ROLE_ICON[member.role];
	const roleLabel = ROLE_LABEL[member.role];

	return (
		<button
			type="button"
			onClick={onClick}
			className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-muted/40">
			<ChatAvatar
				name={member.displayName}
				avatarUrl={member.avatarUrl}
				size="default"
				online={isOnline}
			/>
			<div className="min-w-0 flex-1">
				<div className="flex items-center gap-1.5">
					<span className="truncate text-[13px] font-medium leading-tight">
						{member.displayName}
					</span>
					{isCurrentUser && (
						<span className="shrink-0 rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold text-primary">
							вы
						</span>
					)}
					{RoleIcon && (
						<span className="shrink-0 flex items-center gap-0.5 rounded-full bg-muted/60 px-1.5 py-0.5 text-[9px] font-semibold text-muted-foreground">
							<RoleIcon className="size-2.5" />
							{roleLabel}
						</span>
					)}
				</div>
				<p className="text-[11px] text-muted-foreground/60 leading-tight mt-0.5">
					@{member.username}
				</p>
			</div>
		</button>
	);
});
