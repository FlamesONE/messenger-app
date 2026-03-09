import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Check, Loader2 } from "lucide-react";
import { memo, useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { showError, showSuccess } from "@/shared/ui/custom-toast";
import { useAuthStore, useUpdateProfile } from "@/entities/user";
import { uploadFile } from "@/shared/api/upload";
import type { ProfileFormData } from "@/shared/lib/validation/profile";
import { profileSchema } from "@/shared/lib/validation/profile";
import { ChatAvatar } from "@/shared/ui/chat-avatar";
import { Button } from "@/shared/ui/components/ui/button";
import { Input } from "@/shared/ui/components/ui/input";
import { Label } from "@/shared/ui/components/ui/label";
import { ErrorAlert } from "@/shared/ui/error-alert";
import { AppDrawer } from "@/shared/ui/app-drawer";

interface Props {
	open: boolean;
	onClose: () => void;
}

export const ProfileSettingsDialog = memo(function ProfileSettingsDialog({ open, onClose }: Props) {
	const user = useAuthStore((s) => s.user);
	const [avatarUploading, setAvatarUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const updateProfile = useUpdateProfile();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<ProfileFormData>({
		resolver: zodResolver(profileSchema),
		values: { displayName: user?.displayName || "" },
	});

	const handleAvatarChange = useCallback(
		async (e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (!file) return;
			if (!file.type.startsWith("image/")) {
				showError("Выберите изображение");
				return;
			}
			if (file.size > 5 * 1024 * 1024) {
				showError("Максимальный размер — 5 МБ");
				return;
			}

			setAvatarUploading(true);
			setUploadProgress(0);
			try {
				const result = await uploadFile(file, (pct) => setUploadProgress(pct));
				await updateProfile.mutateAsync({ avatarUrl: result.url });
				showSuccess("Аватар обновлён");
			} catch {
				showError("Не удалось загрузить аватар");
			} finally {
				setAvatarUploading(false);
				setUploadProgress(0);
				e.target.value = "";
			}
		},
		[updateProfile],
	);

	const onSubmit = handleSubmit(async (data) => {
		try {
			await updateProfile.mutateAsync(data);
			showSuccess("Профиль обновлён");
			onClose();
		} catch {
			showError("Не удалось обновить профиль");
		}
	});

	const handleOpenChange = useCallback(
		(v: boolean) => { if (!v) onClose(); },
		[onClose],
	);

	if (!user) return null;

	return (
		<AppDrawer
			open={open}
			onOpenChange={handleOpenChange}
			title="Настройки профиля"
		>
			<div className="flex flex-col gap-6">
				{/* Avatar section */}
				<div className="flex flex-col items-center">
					<label className="relative cursor-pointer group">
						<div className="relative">
							<ChatAvatar name={user.displayName} avatarUrl={user.avatarUrl} size="xl" />

							{/* Progress ring */}
							{avatarUploading && (
								<svg className="absolute inset-0 size-full -rotate-90" viewBox="0 0 80 80">
									<circle
										cx="40" cy="40" r="37"
										fill="none"
										stroke="currentColor"
										strokeWidth="3"
										className="text-primary/20"
									/>
									<circle
										cx="40" cy="40" r="37"
										fill="none"
										stroke="currentColor"
										strokeWidth="3"
										strokeDasharray={`${2 * Math.PI * 37}`}
										strokeDashoffset={`${2 * Math.PI * 37 * (1 - uploadProgress / 100)}`}
										strokeLinecap="round"
										className="text-primary transition-all duration-300"
									/>
								</svg>
							)}

							{/* Hover overlay */}
							<div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
								{avatarUploading ? (
									<span className="text-[11px] font-bold text-white">{uploadProgress}%</span>
								) : (
									<Camera className="size-5 text-white" />
								)}
							</div>
						</div>
						<input
							type="file"
							accept="image/jpeg,image/png,image/webp,image/gif"
							className="hidden"
							onChange={handleAvatarChange}
							disabled={avatarUploading}
						/>
					</label>
					<p className="mt-2 text-[11px] text-muted-foreground/60">
						Нажмите для смены аватара
					</p>
				</div>

				{/* Form */}
				<form onSubmit={onSubmit} className="flex flex-col gap-4">
					<ErrorAlert error={updateProfile.error} />

					<div className="flex flex-col gap-1.5">
						<Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
							Email
						</Label>
						<Input value={user.email} disabled className="opacity-50 bg-muted/30" />
					</div>

					<div className="flex flex-col gap-1.5">
						<Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
							Имя пользователя
						</Label>
						<Input value={`@${user.username}`} disabled className="opacity-50 bg-muted/30" />
					</div>

					<div className="flex flex-col gap-1.5">
						<Label
							htmlFor="displayName"
							className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60"
						>
							Отображаемое имя
						</Label>
						<Input id="displayName" {...register("displayName")} />
						{errors.displayName && (
							<p className="text-[11px] text-destructive">{errors.displayName.message}</p>
						)}
					</div>

					<div className="flex gap-2 justify-end pt-3 border-t border-border/40">
						<Button variant="ghost" type="button" onClick={onClose} className="rounded-xl">
							Отмена
						</Button>
						<Button type="submit" disabled={updateProfile.isPending} className="rounded-xl gap-2">
							{updateProfile.isPending ? (
								<Loader2 className="size-4 animate-spin" />
							) : (
								<Check className="size-4" />
							)}
							Сохранить
						</Button>
					</div>
				</form>
			</div>
		</AppDrawer>
	);
});
