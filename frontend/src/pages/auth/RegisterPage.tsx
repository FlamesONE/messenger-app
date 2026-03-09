import { RegisterForm } from "@/features/auth";
import { AuthLayout } from "@/shared/ui/auth-layout";

export function RegisterPage() {
	return (
		<AuthLayout title="Регистрация" subtitle="Создайте аккаунт для начала общения">
			<RegisterForm />
		</AuthLayout>
	);
}
