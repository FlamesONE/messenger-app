import { treaty } from "@elysiajs/eden";
import type { App } from "@backend/main";

export const api = treaty<App>("/api");
