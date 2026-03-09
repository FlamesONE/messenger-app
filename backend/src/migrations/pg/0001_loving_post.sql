ALTER TABLE "chats" ADD COLUMN "invite_code" varchar(32);--> statement-breakpoint
ALTER TABLE "chats" ADD CONSTRAINT "chats_invite_code_unique" UNIQUE("invite_code");