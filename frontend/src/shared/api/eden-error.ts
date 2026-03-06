import { EdenFetchError } from "@elysiajs/eden";

/**
 * Extract a human-readable error message from an Eden treaty error.
 *
 * Eden wraps HTTP errors as `EdenFetchError { status, value }`.
 * `value` can be a string or an object with a `message` field,
 * depending on what the Elysia backend returns.
 */
export function edenError(error: unknown, fallback: string): string {
	if (error instanceof EdenFetchError) {
		const v = error.value;
		if (typeof v === "string") return v;
		if (typeof v === "object" && v !== null && "message" in v && typeof v.message === "string")
			return v.message;
	}
	if (error instanceof Error) return error.message;
	return fallback;
}
