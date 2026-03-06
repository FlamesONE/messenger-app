import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, User, Users, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { useChatStore, useCreateChat } from "@/entities/chat";
import type { CreateChatFormData } from "@/shared/lib/validation/chat";
import { createChatSchema } from "@/shared/lib/validation/chat";
import { Button } from "@/shared/ui/components/ui/button";
import { Input } from "@/shared/ui/components/ui/input";
import { Label } from "@/shared/ui/components/ui/label";

interface Props {
	open: boolean;
	onClose: () => void;
}

export function NewChatDialog({ open, onClose }: Props) {
	const setActiveChat = useChatStore((s) => s.setActiveChat);
	const createChat = useCreateChat();

	const {
		register,
		handleSubmit,
		watch,
		setValue,
		reset,
		formState: { errors },
	} = useForm<CreateChatFormData>({
		resolver: zodResolver(createChatSchema),
		defaultValues: { isGroup: false, memberIds: "", groupName: "" },
	});

	const isGroup = watch("isGroup");

	const onSubmit = handleSubmit(async (data) => {
		const memberIds = data.memberIds
			.split(",")
			.map((s) => s.trim())
			.filter(Boolean);

		try {
			const chat = await createChat.mutateAsync({
				name: data.isGroup ? data.groupName || undefined : undefined,
				isGroup: data.isGroup,
				memberIds,
			});
			setActiveChat(chat.id);
			onClose();
			reset();
		} catch {
			// error is in createChat.error
		}
	});

	if (!open) return null;

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: backdrop overlay
		<div
			role="presentation"
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-in fade-in"
			onClick={onClose}
			onKeyDown={(e) => e.key === "Escape" && onClose()}
		>
			{/* biome-ignore lint/a11y/noStaticElementInteractions: stop propagation on dialog */}
			<div
				role="presentation"
				className="w-full max-w-sm rounded-xl bg-card p-5 shadow-2xl animate-in zoom-in-95"
				onClick={(e) => e.stopPropagation()}
				onKeyDown={(e) => e.stopPropagation()}
			>
				<div className="flex items-center justify-between mb-5">
					<h2 className="text-lg font-semibold">Новый чат</h2>
					<button
						type="button"
						onClick={onClose}
						className="rounded-full p-1 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
					>
						<X className="size-5" />
					</button>
				</div>

				<form onSubmit={onSubmit} className="flex flex-col gap-4">
					{createChat.error && (
						<div className="rounded-lg bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
							{createChat.error.message}
						</div>
					)}

					<div className="flex gap-2">
						<button
							type="button"
							onClick={() => setValue("isGroup", false)}
							className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
								!isGroup
									? "border-primary bg-primary/10 text-primary"
									: "border-border text-muted-foreground hover:bg-secondary"
							}`}
						>
							<User className="size-4" />
							Личный
						</button>
						<button
							type="button"
							onClick={() => setValue("isGroup", true)}
							className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
								isGroup
									? "border-primary bg-primary/10 text-primary"
									: "border-border text-muted-foreground hover:bg-secondary"
							}`}
						>
							<Users className="size-4" />
							Группа
						</button>
					</div>

					{isGroup && (
						<div className="flex flex-col gap-1.5">
							<Label htmlFor="groupName">Название группы</Label>
							<Input id="groupName" placeholder="Моя группа" {...register("groupName")} />
						</div>
					)}

					<div className="flex flex-col gap-1.5">
						<Label htmlFor="memberIds">
							{isGroup ? "ID участников (через запятую)" : "ID пользователя"}
						</Label>
						<Input id="memberIds" placeholder="Введите ID" {...register("memberIds")} />
						{errors.memberIds && (
							<p className="text-xs text-destructive">{errors.memberIds.message}</p>
						)}
					</div>

					<div className="flex gap-2 justify-end pt-1">
						<Button type="button" variant="ghost" onClick={onClose}>
							Отмена
						</Button>
						<Button type="submit" disabled={createChat.isPending}>
							{createChat.isPending ? <Loader2 className="size-4 animate-spin" /> : "Создать"}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}
