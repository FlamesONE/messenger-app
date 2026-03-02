import { DomainError } from "@/shared/errors";
import { logger } from "@/shared/logger";

const errorStatusMap: Record<string, number> = {
	NOT_FOUND: 404,
	UNAUTHORIZED: 401,
	FORBIDDEN: 403,
	BAD_REQUEST: 400,
	CONFLICT: 409,
};

export function mapErrorToResponse(error: Error, elysiaCode: string | number): Response {
	if (error instanceof DomainError) {
		const status = errorStatusMap[error.code] ?? 500;
		return new Response(
			JSON.stringify({ error: error.code, message: error.message }),
			{ status, headers: { "Content-Type": "application/json" } },
		);
	}

	logger.error(error, "Unhandled error");

	const status = elysiaCode === "VALIDATION" ? 422 : 500;
	return new Response(
		JSON.stringify({
			error: elysiaCode,
			message:
				elysiaCode === "VALIDATION" ? error.message : "Internal Server Error",
		}),
		{ status, headers: { "Content-Type": "application/json" } },
	);
}
