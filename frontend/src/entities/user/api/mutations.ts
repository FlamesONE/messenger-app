import { useMutation } from "@tanstack/react-query";
import { api } from "@/shared/api";
import type { LoginFormData, RegisterFormData } from "@/shared/lib/validation/auth";
import { useAuthStore } from "../model/store";
import type { User } from "../model/types";

export function useLogin() {
	const setAuth = useAuthStore((s) => s.setAuth);

	return useMutation({
		mutationFn: async (data: LoginFormData) => {
			const { data: res, error } = await api.auth.login.post(data);
			if (error) throw error;
			return res as { user: User; token: string };
		},
		onSuccess: (res) => {
			setAuth(res.user, res.token);
		},
	});
}

export function useRegister() {
	const setAuth = useAuthStore((s) => s.setAuth);

	return useMutation({
		mutationFn: async (data: Omit<RegisterFormData, "confirmPassword">) => {
			const { data: res, error } = await api.auth.register.post(data);
			if (error) throw error;
			return res as { user: User; token: string };
		},
		onSuccess: (res) => {
			setAuth(res.user, res.token);
		},
	});
}
