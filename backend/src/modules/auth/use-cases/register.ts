import bcrypt from "bcrypt";
import type { IUserRepository } from "@/repositories/interfaces/user.repository";
import { ConflictError } from "@/shared/errors";
import type { RegisterDto } from "../dto/register.dto";

export class RegisterUseCase {
	constructor(private readonly userRepo: IUserRepository) {}

	async execute(dto: RegisterDto) {
		const existingEmail = await this.userRepo.findByEmail(dto.email);
		if (existingEmail) {
			throw new ConflictError("Email already in use");
		}

		const existingUsername = await this.userRepo.findByUsername(dto.username);
		if (existingUsername) {
			throw new ConflictError("Username already taken");
		}

		const passwordHash = await bcrypt.hash(dto.password, 12);

		const user = await this.userRepo.create({
			email: dto.email,
			username: dto.username,
			displayName: dto.displayName,
			passwordHash,
		});

		return {
			id: user.id,
			email: user.email,
			username: user.username,
			displayName: user.displayName,
		};
	}
}
