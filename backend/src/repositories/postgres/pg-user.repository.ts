import { eq } from "drizzle-orm";
import type {
	CreateUserData,
	IUserRepository,
	UpdateUserData,
	UserRecord,
} from "@/repositories/interfaces/user.repository";
import { db } from "@/infrastructure/pg/client";
import { users } from "@/infrastructure/pg/schema";

export class PgUserRepository implements IUserRepository {
	async findById(id: string): Promise<UserRecord | null> {
		const row = await db.query.users.findFirst({
			where: eq(users.id, id),
		});
		return row ?? null;
	}

	async findByEmail(email: string): Promise<UserRecord | null> {
		const row = await db.query.users.findFirst({
			where: eq(users.email, email),
		});
		return row ?? null;
	}

	async findByUsername(username: string): Promise<UserRecord | null> {
		const row = await db.query.users.findFirst({
			where: eq(users.username, username),
		});
		return row ?? null;
	}

	async create(data: CreateUserData): Promise<UserRecord> {
		const [user] = await db.insert(users).values(data).returning();
		return user;
	}

	async update(id: string, data: UpdateUserData): Promise<UserRecord | null> {
		const [user] = await db
			.update(users)
			.set({ ...data, updatedAt: new Date() })
			.where(eq(users.id, id))
			.returning();
		return user ?? null;
	}
}
