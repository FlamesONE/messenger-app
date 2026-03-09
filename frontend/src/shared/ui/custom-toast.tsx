import { Check, CircleAlert, Image, Info, X } from "lucide-react";
import { toast } from "sonner";
import { ChatAvatar } from "./chat-avatar";

interface MessageToastProps {
	id: string | number;
	senderName: string;
	senderAvatar?: string;
	chatName?: string;
	content: string;
	onOpen?: () => void;
}

function MessageToast({ id, senderName, senderAvatar, chatName, content, onOpen }: MessageToastProps) {
	const isMedia = !content || content === "Медиа";

	return (
		<div
			className="flex w-[356px] items-start gap-3 rounded-2xl border border-surface-border bg-surface-elevated px-4 py-3 shadow-lg shadow-black/8 cursor-pointer transition-all hover:shadow-xl"
			onClick={() => { onOpen?.(); toast.dismiss(id); }}
			role="button"
			tabIndex={0}
			onKeyDown={(e) => { if (e.key === "Enter") { onOpen?.(); toast.dismiss(id); } }}
		>
			<ChatAvatar name={senderName} avatarUrl={senderAvatar} size="default" />
			<div className="min-w-0 flex-1">
				<div className="flex items-baseline gap-1.5">
					<p className="truncate text-[13px] font-semibold leading-tight">
						{senderName}
					</p>
					{chatName && (
						<span className="shrink-0 text-[11px] text-surface-muted">
							· {chatName}
						</span>
					)}
				</div>
				{isMedia ? (
					<p className="mt-1 flex items-center gap-1 text-[12.5px] leading-snug text-surface-muted">
						<Image className="size-3.5" />
						Медиа
					</p>
				) : (
					<p className="mt-0.5 line-clamp-2 text-[12.5px] leading-snug text-surface-muted">
						{content}
					</p>
				)}
			</div>
			<button
				type="button"
				onClick={(e) => { e.stopPropagation(); toast.dismiss(id); }}
				className="shrink-0 rounded-md p-0.5 text-surface-muted/50 transition-colors hover:text-foreground"
			>
				<X className="size-3.5" />
			</button>
		</div>
	);
}

export function showMessageToast(
	senderName: string,
	content: string,
	options?: { senderAvatar?: string; chatName?: string; onOpen?: () => void },
) {
	toast.custom(
		(id) => (
			<MessageToast
				id={id}
				senderName={senderName}
				senderAvatar={options?.senderAvatar}
				chatName={options?.chatName}
				content={content}
				onOpen={options?.onOpen}
			/>
		),
		{ duration: 5000, unstyled: true },
	);
}

const ICON_MAP = {
	success: <Check className="size-4" strokeWidth={2.5} />,
	error: <CircleAlert className="size-4" />,
	info: <Info className="size-4" />,
	warning: <CircleAlert className="size-4" />,
} as const;

const COLOR_MAP = {
	success: "bg-emerald-500/15 text-emerald-500",
	error: "bg-destructive/15 text-destructive",
	info: "bg-primary/15 text-primary",
	warning: "bg-amber-500/15 text-amber-500",
} as const;

interface StatusToastProps {
	id: string | number;
	type: keyof typeof ICON_MAP;
	message: string;
}

function StatusToast({ id, type, message }: StatusToastProps) {
	return (
		<div
			className="flex w-[320px] items-center gap-2.5 rounded-xl border border-surface-border bg-surface-elevated px-3.5 py-2.5 shadow-lg shadow-black/8"
		>
			<div className={`flex size-7 shrink-0 items-center justify-center rounded-lg ${COLOR_MAP[type]}`}>
				{ICON_MAP[type]}
			</div>
			<p className="min-w-0 flex-1 text-[13px] leading-snug">{message}</p>
			<button
				type="button"
				onClick={() => toast.dismiss(id)}
				className="shrink-0 rounded-md p-0.5 text-surface-muted/50 transition-colors hover:text-foreground"
			>
				<X className="size-3.5" />
			</button>
		</div>
	);
}

export function showSuccess(message: string) {
	toast.custom((id) => <StatusToast id={id} type="success" message={message} />, { duration: 3000, unstyled: true });
}

export function showError(message: string) {
	toast.custom((id) => <StatusToast id={id} type="error" message={message} />, { duration: 5000, unstyled: true });
}

export function showInfo(message: string) {
	toast.custom((id) => <StatusToast id={id} type="info" message={message} />, { duration: 3500, unstyled: true });
}

export function showWarning(message: string) {
	toast.custom((id) => <StatusToast id={id} type="warning" message={message} />, { duration: 4000, unstyled: true });
}
