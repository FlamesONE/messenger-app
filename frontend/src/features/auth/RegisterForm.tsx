import { zodResolver } from "@hookform/resolvers/zod";
import { memo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { useRegister } from "@/entities/user";
import { edenError } from "@/shared/api/eden-error";
import type { RegisterFormData } from "@/shared/lib/validation/auth";
import { registerSchema } from "@/shared/lib/validation/auth";
import { ErrorAlert } from "@/shared/ui/error-alert";
import { AuthInput } from "./AuthInput";
import { AuthSubmitButton } from "./AuthSubmitButton";

export const RegisterForm = memo(function RegisterForm() {
	const navigate = useNavigate();
	const registerMutation = useRegister();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<RegisterFormData>({
		resolver: zodResolver(registerSchema),
	});

	const onSubmit = useCallback(
		handleSubmit(async (data) => {
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
		}),
		[handleSubmit, registerMutation, navigate],
	);

	const displayError = registerMutation.error
		? edenError(registerMutation.error, "Ошибка регистрации")
		: null;

	return (
		<form onSubmit={onSubmit} className="flex flex-col gap-5">
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

			<div className="grid grid-cols-2 gap-4">
				<AuthInput
					id="username"
					type="text"
					label="Username"
					required
					placeholder="johndoe"
					autoComplete="username"
					error={errors.username?.message}
					{...register("username")}
				/>

				<AuthInput
					id="displayName"
					type="text"
					label="Имя"
					placeholder="Иван"
					error={errors.displayName?.message}
					{...register("displayName")}
				/>
			</div>

			<AuthInput
				id="password"
				type="password"
				label="Пароль"
				required
				placeholder="Минимум 8 символов"
				autoComplete="new-password"
				error={errors.password?.message}
				{...register("password")}
			/>

			<AuthInput
				id="confirmPassword"
				type="password"
				label="Повторите пароль"
				required
				placeholder="Ещё раз"
				autoComplete="new-password"
				error={errors.confirmPassword?.message}
				{...register("confirmPassword")}
			/>

			<AuthSubmitButton loading={registerMutation.isPending} label="Создать аккаунт" />

			<p className="text-center text-sm text-muted-foreground">
				Уже есть аккаунт?{" "}
				<Link
					to="/login"
					className="font-medium text-foreground underline underline-offset-4 transition-colors hover:opacity-70"
				>
					Войти
				</Link>
			</p>
		</form>
	);
});
