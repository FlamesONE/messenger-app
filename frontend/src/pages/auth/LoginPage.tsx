import { LoginForm } from "@/features/auth";
import { AuthLayout } from "@/shared/ui/auth-layout";

export function LoginPage() {
	return (
		<AuthLayout title="Вход" subtitle="Войдите в свой аккаунт">
			<LoginForm />
		</AuthLayout>
	);
}
