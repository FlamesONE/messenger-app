import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, MessageCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { useLogin } from "@/entities/user";
import { edenError } from "@/shared/api/eden-error";
import type { LoginFormData } from "@/shared/lib/validation/auth";
import { loginSchema } from "@/shared/lib/validation/auth";
import { Button } from "@/shared/ui/components/ui/button";
import { Input } from "@/shared/ui/components/ui/input";
import { Label } from "@/shared/ui/components/ui/label";

export function LoginPage() {
	const navigate = useNavigate();
	const login = useLogin();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
	});

	const onSubmit = handleSubmit(async (data) => {
		try {
			await login.mutateAsync(data);
			navigate("/", { replace: true });
		} catch {
			// error is in login.error
		}
	});

	const displayError = login.error ? edenError(login.error, "Неверный email или пароль") : null;

	return (
		<div className="flex min-h-screen items-center justify-center bg-background">
			<div className="w-full max-w-sm px-6">
				<div className="mb-8 flex flex-col items-center gap-3">
					<div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
						<MessageCircle className="size-8 text-primary" />
					</div>
					<h1 className="text-2xl font-semibold tracking-tight">Messenger</h1>
					<p className="text-sm text-muted-foreground">Войдите в свой аккаунт</p>
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
						<Label htmlFor="password">Пароль</Label>
						<Input
							id="password"
							type="password"
							placeholder="Введите пароль"
							autoComplete="current-password"
							{...register("password")}
						/>
						{errors.password && (
							<p className="text-xs text-destructive">{errors.password.message}</p>
						)}
					</div>

					<Button type="submit" className="mt-2 w-full" disabled={login.isPending}>
						{login.isPending ? <Loader2 className="size-4 animate-spin" /> : "Войти"}
					</Button>

					<p className="text-center text-sm text-muted-foreground">
						Нет аккаунта?{" "}
						<Link to="/register" className="font-medium text-primary hover:underline">
							Зарегистрироваться
						</Link>
					</p>
				</form>
			</div>
		</div>
	);
}
