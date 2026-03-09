import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { api } from "@/shared/api";
import { useAuthStore } from "../model/store";
import type { User } from "../model/types";

export const userKeys = {
	me: ["user", "me"] as const,
	search: (q: string) => ["user", "search", q] as const,
	profile: (id: string) => ["user", "profile", id] as const,
};

export function useMe(enabled: boolean) {
	const setUser = useAuthStore((s) => s.setUser);

	const query = useQuery({
		queryKey: userKeys.me,
		queryFn: async () => {
			const { data, error } = await api.users.me.get();
			if (error) throw error;
			return data as User;
		},
		enabled,
	});

	useEffect(() => {
		if (query.data) {
			setUser(query.data);
		}
	}, [query.data, setUser]);

	return query;
}

export function useSearchUsers(query: string) {
	return useQuery({
		queryKey: userKeys.search(query),
		queryFn: async () => {
			const { data, error } = await api.users.search.get({ query: { q: query } });
			if (error) throw error;
			return data as User[];
		},
		enabled: query.trim().length >= 1,
		placeholderData: (prev) => prev,
	});
}

export function useUserProfile(userId: string | null) {
	return useQuery({
		queryKey: userKeys.profile(userId || ""),
		queryFn: async () => {
			// biome-ignore lint/suspicious/noExplicitAny: eden dynamic path
			const { data, error } = await (api.users as any)[userId!].get();
			if (error) throw error;
			return data as User;
		},
		enabled: !!userId,
	});
}
