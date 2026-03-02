import { eq } from "drizzle-orm";
import type {
	CreateUserData,
	IUserRepository,
	UpdateUserData,
	UserRecord,
} from "@/repositories/interfaces/user.repository";
import { db } from "./pg.client";
import { users } from "./schema";

export class PgUserRepository implements IUserRepository {
	async findById(id: string): Promise<UserRecord | null> {
		const [user] = await db
			.select()
			.from(users)
			.where(eq(users.id, id))
			.limit(1);
		return user ?? null;
	}

	async findByEmail(email: string): Promise<UserRecord | null> {
		const [user] = await db
			.select()
			.from(users)
			.where(eq(users.email, email))
			.limit(1);
		return user ?? null;
	}

	async findByUsername(username: string): Promise<UserRecord | null> {
		const [user] = await db
			.select()
			.from(users)
			.where(eq(users.username, username))
			.limit(1);
		return user ?? null;
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
