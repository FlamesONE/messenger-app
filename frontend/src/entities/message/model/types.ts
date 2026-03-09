import type {
	ApiMessage,
	ApiMediaAttachment,
	ApiSendMessagePayload,
	ApiReaction,
} from "@backend/shared/types/api-types";

export type MediaAttachment = ApiMediaAttachment;
export type SendMessagePayload = ApiSendMessagePayload;
export type Reaction = ApiReaction;

export interface Message extends ApiMessage {
	/** Client-only: true while sending (optimistic) */
	_optimistic?: boolean;
	/** Client-only: true if optimistic send failed */
	_failed?: boolean;
	/** Client-only: saved payload for retry on failure */
	_failedPayload?: SendMessagePayload;
}
