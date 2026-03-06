import { useQuery } from "@tanstack/react-query";
import { api } from "@/shared/api";
import type { User } from "../model/types";

export const userKeys = {
	me: ["user", "me"] as const,
};

export function useMe(enabled: boolean) {
	return useQuery({
		queryKey: userKeys.me,
		queryFn: async () => {
			const { data, error } = await api.users.me.get();
			if (error) throw error;
			return data as User;
		},
		enabled,
	});
}
