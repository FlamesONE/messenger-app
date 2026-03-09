import { Elysia, t } from "elysia";
import type { IFileStorage } from "@/repositories/interfaces/file-storage";
import { logger } from "@/shared/logger";

export function filesHttp(fileStorage: IFileStorage) {
	return new Elysia({ name: "files-http", prefix: "/files" })
		.get(
			"/*",
			async ({ params, set }) => {
				const key = decodeURIComponent(params["*"]);

				if (!key || key.includes("..")) {
					set.status = 400;
					return { error: "Invalid key" };
				}

				try {
					const file = await fileStorage.getObject(key);

					if (!file.body) {
						set.status = 404;
						return { error: "Not found" };
					}

					set.headers["Content-Type"] = file.contentType || "application/octet-stream";
					set.headers["Cache-Control"] = "public, max-age=31536000, immutable";

					if (file.contentLength) {
						set.headers["Content-Length"] = String(file.contentLength);
					}

					return new Response(file.body as ReadableStream);
				} catch (err: unknown) {
					const code = (err as { name?: string })?.name;
					if (code === "NoSuchKey" || code === "NotFound") {
						set.status = 404;
						return { error: "Not found" };
					}
					logger.error(err, "File proxy error");
					set.status = 500;
					return { error: "Internal error" };
				}
			},
			{
				params: t.Object({ "*": t.String() }),
			},
		);
}
