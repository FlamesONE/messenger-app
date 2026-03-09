import { zodResolver } from "@hookform/resolvers/zod";
import { memo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { useLogin } from "@/entities/user";
import { edenError } from "@/shared/api/eden-error";
import type { LoginFormData } from "@/shared/lib/validation/auth";
import { loginSchema } from "@/shared/lib/validation/auth";
import { ErrorAlert } from "@/shared/ui/error-alert";
import { AuthInput } from "./AuthInput";
import { AuthSubmitButton } from "./AuthSubmitButton";

export const LoginForm = memo(function LoginForm() {
	const navigate = useNavigate();
	const login = useLogin();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
	});

	const onSubmit = useCallback(
		handleSubmit(async (data) => {
			try {
				await login.mutateAsync(data);
				navigate("/", { replace: true });
			} catch {
				// error is in login.error
			}
		}),
		[handleSubmit, login, navigate],
	);

	const displayError = login.error ? edenError(login.error, "Неверный email или пароль") : null;

	return (
		<form onSubmit={onSubmit} className="flex flex-col gap-6">
			<ErrorAlert error={displayError} />

			<AuthInput
				id="email"
				type="email"
				label="Email"
				required
				placeholder="you@example.com"
				autoComplete="email"
				error={errors.email?.message}
				{...register("email")}
			/>

			<AuthInput
				id="password"
				type="password"
				label="Пароль"
				required
				placeholder="Введите пароль"
				autoComplete="current-password"
				error={errors.password?.message}
				{...register("password")}
			/>

			<AuthSubmitButton loading={login.isPending} label="Войти" />

			<p className="text-center text-sm text-muted-foreground">
				Нет аккаунта?{" "}
				<Link
					to="/register"
					className="font-medium text-foreground underline underline-offset-4 transition-colors hover:opacity-70"
				>
					Зарегистрироваться
				</Link>
			</p>
		</form>
	);
});
