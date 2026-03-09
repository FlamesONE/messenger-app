import { memo } from "react";

interface ErrorAlertProps {
	error: unknown;
	fallback?: string;
}

export const ErrorAlert = memo(function ErrorAlert({ error, fallback }: ErrorAlertProps) {
	if (!error) return null;

	const message =
		error instanceof Error ? error.message : typeof error === "string" ? error : fallback;

	if (!message) return null;

	return (
		<div className="rounded-lg bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
			{message}
		</div>
	);
});
