import bcrypt from "bcrypt";
import type { IUserRepository } from "@/repositories/interfaces/user.repository";
import { UnauthorizedError } from "@/shared/errors";
import type { LoginDto } from "../dto/login.dto";

export class LoginUseCase {
	constructor(private readonly userRepo: IUserRepository) {}

	async execute(dto: LoginDto) {
		const user = await this.userRepo.findByEmail(dto.email);
		if (!user) {
			throw new UnauthorizedError("Invalid credentials");
		}

		const valid = await bcrypt.compare(dto.password, user.passwordHash);
		if (!valid) {
			throw new UnauthorizedError("Invalid credentials");
		}

		return {
			id: user.id,
			email: user.email,
			username: user.username,
			displayName: user.displayName,
		};
	}
}
