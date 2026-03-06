import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, MessageCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { useRegister } from "@/entities/user";
import { edenError } from "@/shared/api/eden-error";
import type { RegisterFormData } from "@/shared/lib/validation/auth";
import { registerSchema } from "@/shared/lib/validation/auth";
import { Button } from "@/shared/ui/components/ui/button";
import { Input } from "@/shared/ui/components/ui/input";
import { Label } from "@/shared/ui/components/ui/label";

export function RegisterPage() {
	const navigate = useNavigate();
	const registerMutation = useRegister();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<RegisterFormData>({
		resolver: zodResolver(registerSchema),
	});

	const onSubmit = handleSubmit(async (data) => {
		try {
			await registerMutation.mutateAsync({
				email: data.email,
				username: data.username,
				displayName: data.displayName || data.username,
				password: data.password,
			});
			navigate("/", { replace: true });
		} catch {
			// error is in registerMutation.error
		}
	});

	const displayError = registerMutation.error
		? edenError(registerMutation.error, "Ошибка регистрации")
		: null;

	return (
		<div className="flex min-h-screen items-center justify-center bg-background">
			<div className="w-full max-w-sm px-6">
				<div className="mb-8 flex flex-col items-center gap-3">
					<div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
						<MessageCircle className="size-8 text-primary" />
					</div>
					<h1 className="text-2xl font-semibold tracking-tight">Регистрация</h1>
					<p className="text-sm text-muted-foreground">Создайте аккаунт для начала общения</p>
				</div>

				<form onSubmit={onSubmit} className="flex flex-col gap-4">
					{displayError && (
						<div className="rounded-lg bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
							{displayError}
						</div>
					)}

					<div className="flex flex-col gap-1.5">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							type="email"
							placeholder="you@example.com"
							autoComplete="email"
							{...register("email")}
						/>
						{errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
					</div>

					<div className="flex flex-col gap-1.5">
						<Label htmlFor="username">Имя пользователя</Label>
						<Input
							id="username"
							type="text"
							placeholder="johndoe"
							autoComplete="username"
							{...register("username")}
						/>
						{errors.username && (
							<p className="text-xs text-destructive">{errors.username.message}</p>
						)}
					</div>

					<div className="flex flex-col gap-1.5">
						<Label htmlFor="displayName">Отображаемое имя</Label>
						<Input
							id="displayName"
							type="text"
							placeholder="Иван Иванов"
							{...register("displayName")}
						/>
						{errors.displayName && (
							<p className="text-xs text-destructive">{errors.displayName.message}</p>
						)}
					</div>

					<div className="flex flex-col gap-1.5">
						<Label htmlFor="password">Пароль</Label>
						<Input
							id="password"
							type="password"
							placeholder="Минимум 8 символов"
							autoComplete="new-password"
							{...register("password")}
						/>
						{errors.password && (
							<p className="text-xs text-destructive">{errors.password.message}</p>
						)}
					</div>

					<div className="flex flex-col gap-1.5">
						<Label htmlFor="confirmPassword">Повторите пароль</Label>
						<Input
							id="confirmPassword"
							type="password"
							placeholder="Ещё раз пароль"
							autoComplete="new-password"
							{...register("confirmPassword")}
						/>
						{errors.confirmPassword && (
							<p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
						)}
					</div>

					<Button type="submit" className="mt-2 w-full" disabled={registerMutation.isPending}>
						{registerMutation.isPending ? (
							<Loader2 className="size-4 animate-spin" />
						) : (
							"Создать аккаунт"
						)}
					</Button>

					<p className="text-center text-sm text-muted-foreground">
						Уже есть аккаунт?{" "}
						<Link to="/login" className="font-medium text-primary hover:underline">
							Войти
						</Link>
					</p>
				</form>
			</div>
		</div>
	);
}
