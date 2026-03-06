import type { CacheService } from "@/infrastructure/redis/cache.service";
import type {
	CreateUserData,
	IUserRepository,
	UpdateUserData,
	UserRecord,
} from "../interfaces/user.repository";

const TTL = 300; // 5 min

export class CachedUserRepository implements IUserRepository {
	constructor(
		private readonly pgUserRepo: IUserRepository,
		private readonly cacheService: CacheService,
	) {}

	async findById(id: string): Promise<UserRecord | null> {
		const key = `user:${id}`;
		const cached = await this.cacheService.get<UserRecord>(key);
		if (cached) return cached;

		const user = await this.pgUserRepo.findById(id);
		if (user) await this.cacheService.set(key, user, TTL);
		return user;
	}

	async findByEmail(email: string): Promise<UserRecord | null> {
		const key = `user:email:${email}`;
		const cached = await this.cacheService.get<UserRecord>(key);
		if (cached) return cached;

		const user = await this.pgUserRepo.findByEmail(email);
		if (user) await this.cacheService.set(key, user, TTL);
		return user;
	}

	async findByUsername(username: string): Promise<UserRecord | null> {
		const key = `user:username:${username}`;
		const cached = await this.cacheService.get<UserRecord>(key);
		if (cached) return cached;

		const user = await this.pgUserRepo.findByUsername(username);
		if (user) await this.cacheService.set(key, user, TTL);
		return user;
	}

	async create(data: CreateUserData): Promise<UserRecord> {
		const user = await this.pgUserRepo.create(data);
		await this.cacheService.set(`user:${user.id}`, user, TTL);
		await this.cacheService.set(`user:email:${user.email}`, user, TTL);
		await this.cacheService.set(`user:username:${user.username}`, user, TTL);
		return user;
	}

	async update(id: string, data: UpdateUserData): Promise<UserRecord | null> {
		const user = await this.pgUserRepo.update(id, data);
		if (user) {
			await this.cacheService.set(`user:${user.id}`, user, TTL);
			await this.cacheService.set(`user:email:${user.email}`, user, TTL);
			await this.cacheService.set(`user:username:${user.username}`, user, TTL);
		}
		return user;
	}
}
