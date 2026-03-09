import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/shared/api";
import type { LoginFormData, RegisterFormData } from "@/shared/lib/validation/auth";
import { useAuthStore } from "../model/store";
import type { User } from "../model/types";
import { userKeys } from "./queries";

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

export function useUpdateProfile() {
	const setUser = useAuthStore((s) => s.setUser);
	const qc = useQueryClient();

	return useMutation({
		mutationFn: async (data: { displayName?: string; avatarUrl?: string }) => {
			const { data: res, error } = await api.users.me.patch(data);
			if (error) throw error;
			return res as User;
		},
		onSuccess: (updatedUser) => {
			setUser(updatedUser);
			qc.invalidateQueries({ queryKey: userKeys.me });
		},
	});
}
