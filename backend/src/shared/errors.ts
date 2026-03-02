export class DomainError extends Error {
	constructor(
		message: string,
		public readonly code: string,
	) {
		super(message);
		this.name = this.constructor.name;
	}
}

export class NotFoundError extends DomainError {
	constructor(resource: string, id?: string) {
		super(
			id ? `${resource} with id '${id}' not found` : `${resource} not found`,
			"NOT_FOUND",
		);
	}
}

export class UnauthorizedError extends DomainError {
	constructor(message = "Unauthorized") {
		super(message, "UNAUTHORIZED");
	}
}

export class ForbiddenError extends DomainError {
	constructor(message = "Forbidden") {
		super(message, "FORBIDDEN");
	}
}

export class BadRequestError extends DomainError {
	constructor(message: string) {
		super(message, "BAD_REQUEST");
	}
}

export class ConflictError extends DomainError {
	constructor(message: string) {
		super(message, "CONFLICT");
	}
}
