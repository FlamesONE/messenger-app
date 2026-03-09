import { Calendar, Copy, Mail, MessageCircle, User as UserIcon } from "lucide-react";
import { memo, useCallback, useMemo } from "react";
import { showSuccess } from "@/shared/ui/custom-toast";
import { useChats, useStartDm } from "@/entities/chat";
import type { User } from "@/entities/user";
import { useAuthStore } from "@/entities/user";
import { formatLastSeen } from "@/shared/lib/format-date";
import { usePresenceStore } from "@/entities/user";
import { ChatAvatar } from "@/shared/ui/chat-avatar";
import { AppDrawer } from "@/shared/ui/app-drawer";
import { Button } from "@/shared/ui/components/ui/button";

interface Props {
	user: User | null;
	open: boolean;
	onClose: () => void;
}

export const UserProfileDialog = memo(function UserProfileDialog({ user, open, onClose }: Props) {
	const { data: chats = [] } = useChats();
	const startDm = useStartDm(chats);
	const currentUser = useAuthStore((s) => s.user);
	const isOnline = usePresenceStore((s) => (user ? s.isOnline(user.id) : false));
	const lastSeenAt = usePresenceStore((s) => (user ? s.lastSeen[user.id] : undefined));

	const isMe = currentUser?.id === user?.id;

	const joinedDate = useMemo(() => {
		if (!user?.createdAt) return null;
		return new Date(user.createdAt).toLocaleDateString("ru-RU", {
			day: "numeric",
			month: "long",
			year: "numeric",
		});
	}, [user?.createdAt]);

	const statusText = useMemo(() => {
		if (isOnline) return "В сети";
		if (lastSeenAt) return formatLastSeen(lastSeenAt);
		return "Не в сети";
	}, [isOnline, lastSeenAt]);

	const handleStartChat = useCallback(() => {
		if (!user) return;
		startDm(user);
		onClose();
	}, [user, startDm, onClose]);

	const handleCopyUsername = useCallback(() => {
		if (user) {
			navigator.clipboard.writeText(`@${user.username}`);
			showSuccess("Скопировано");
		}
	}, [user]);

	const handleOpenChange = useCallback(
		(v: boolean) => { if (!v) onClose(); },
		[onClose],
	);

	if (!user) return null;

	return (
		<AppDrawer
			open={open}
			onOpenChange={handleOpenChange}
			title="Профиль"
			variant="surface"
		>
			{/* Hero card */}
			<div className="relative flex flex-col items-center rounded-2xl bg-gradient-to-b from-primary/[0.06] to-transparent px-6 py-6 -mx-1">
				<div className="relative">
					<ChatAvatar name={user.displayName} avatarUrl={user.avatarUrl} size="xl" />
					<span
						className={`absolute bottom-1 right-1 size-3.5 rounded-full border-[2.5px] border-background transition-colors ${
							isOnline ? "bg-emerald-500" : "bg-muted-foreground/30"
						}`}
					/>
				</div>

				<h2 className="mt-3.5 text-[17px] font-bold tracking-tight leading-tight">
					{user.displayName}
				</h2>
				<p className="mt-0.5 text-[13px] text-muted-foreground font-medium">
					@{user.username}
				</p>
				<p className="mt-1.5 text-[11px] text-muted-foreground/70">
					{statusText}
				</p>
			</div>

			{/* Action */}
			{!isMe && (
				<div className="mt-4">
					<Button
						onClick={handleStartChat}
						className="w-full h-10 gap-2.5 rounded-xl font-medium"
					>
						<MessageCircle className="size-[15px]" />
						Написать сообщение
					</Button>
				</div>
			)}

			{/* Info cards */}
			<div className="mt-4 space-y-px rounded-xl overflow-hidden">
				<InfoRow
					icon={<UserIcon className="size-4" />}
					label="Имя пользователя"
					value={`@${user.username}`}
					onClick={handleCopyUsername}
					actionIcon={<Copy className="size-3" />}
				/>
				<InfoRow
					icon={<Mail className="size-4" />}
					label="Email"
					value={user.email}
				/>
				{joinedDate && (
					<InfoRow
						icon={<Calendar className="size-4" />}
						label="Зарегистрирован"
						value={joinedDate}
					/>
				)}
			</div>
		</AppDrawer>
	);
});

const InfoRow = memo(function InfoRow({
	icon,
	label,
	value,
	onClick,
	actionIcon,
}: {
	icon: React.ReactNode;
	label: string;
	value: string;
	onClick?: () => void;
	actionIcon?: React.ReactNode;
}) {
	const Wrapper = onClick ? "button" : "div";
	return (
		<Wrapper
			type={onClick ? "button" : undefined}
			onClick={onClick}
			className={`group flex items-center gap-3 bg-muted/40 px-3.5 py-3 w-full text-left transition-colors ${
				onClick ? "hover:bg-muted/70 active:bg-muted" : ""
			}`}
		>
			<span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-background/80 text-muted-foreground">
				{icon}
			</span>
			<div className="min-w-0 flex-1">
				<p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
					{label}
				</p>
				<p className="text-[13px] font-medium leading-snug">{value}</p>
			</div>
			{actionIcon && (
				<span className="shrink-0 text-muted-foreground/30 transition-colors group-hover:text-muted-foreground">
					{actionIcon}
				</span>
			)}
		</Wrapper>
	);
});
