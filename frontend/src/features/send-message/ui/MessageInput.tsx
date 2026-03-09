import data from "@emoji-mart/data";
import i18n from "@emoji-mart/data/i18n/ru.json";
import Picker from "@emoji-mart/react";
import { Check, Loader2, Paperclip, Pencil, Reply, SendHorizonal, Smile, X } from "lucide-react";
import { type ChangeEvent, memo, useCallback, useEffect, useRef, useState } from "react";
import { showError, showWarning } from "@/shared/ui/custom-toast";
import { useTheme } from "next-themes";
import { useChatStore } from "@/entities/chat";
import { useEditMessage, useSendMessage } from "@/entities/message";
import { useWs } from "@/features/ws";
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE, uploadFile } from "@/shared/api/upload";
import { useTypingIndicator } from "../model/use-typing-indicator";
import { useMessageActionStore } from "../model/message-action-store";
import { cn } from "@/shared/lib/utils";
import { Tip } from "@/shared/ui/tip";
import { FilePreviewGrid } from "./FilePreviewGrid";
import { TypingIndicator } from "./TypingIndicator";
import type { PendingFile } from "../model/types";

let fileIdCounter = 0;

interface MessageInputProps {
	onCreatePendingChat?: () => Promise<string | null>;
	messages?: import("@/entities/message").Message[];
	userId?: string;
}

export const MessageInput = memo(function MessageInput({ onCreatePendingChat, messages, userId }: MessageInputProps) {
	const [files, setFiles] = useState<PendingFile[]>([]);
	const [emojiOpen, setEmojiOpen] = useState(false);
	const [hasContent, setHasContent] = useState(false);
	const sendMessage = useSendMessage();
	const editMessage = useEditMessage();
	const activeChatId = useChatStore((s) => s.activeChatId);
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const emojiRef = useRef<HTMLDivElement>(null);
	const { sendTyping } = useWs();
	const { startTyping, stopTyping } = useTypingIndicator(activeChatId, sendTyping);
	const resolvedTheme = useTheme().resolvedTheme;

	const replyState = useMessageActionStore((s) => s.reply);
	const editState = useMessageActionStore((s) => s.edit);
	const clearAll = useMessageActionStore((s) => s.clearAll);

	const sendMessageRef = useRef(sendMessage);
	sendMessageRef.current = sendMessage;
	const editMessageRef = useRef(editMessage);
	editMessageRef.current = editMessage;
	const activeChatIdRef = useRef(activeChatId);
	activeChatIdRef.current = activeChatId;
	const filesRef = useRef(files);
	filesRef.current = files;
	const onCreatePendingChatRef = useRef(onCreatePendingChat);
	onCreatePendingChatRef.current = onCreatePendingChat;
	const stopTypingRef = useRef(stopTyping);
	stopTypingRef.current = stopTyping;
	const replyStateRef = useRef(replyState);
	replyStateRef.current = replyState;
	const editStateRef = useRef(editState);
	editStateRef.current = editState;
	const clearAllRef = useRef(clearAll);
	clearAllRef.current = clearAll;
	const messagesRef = useRef(messages);
	messagesRef.current = messages;
	const userIdRef = useRef(userId);
	userIdRef.current = userId;

	useEffect(() => {
		if (editState?.message) {
			const el = textareaRef.current;
			if (el) {
				el.value = editState.message.content;
				el.focus();
				el.setSelectionRange(el.value.length, el.value.length);
				requestAnimationFrame(() => {
					el.style.height = "auto";
					el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
				});
			}
			setHasContent(true);
		}
	}, [editState]);

	useEffect(() => {
		clearAll();
	}, [activeChatId, clearAll]);

	const updateHasContent = useCallback(() => {
		const textHas = (textareaRef.current?.value.trim().length ?? 0) > 0;
		const filesHas = filesRef.current.some((f) => f.key);
		setHasContent(textHas || filesHas);
	}, []);

	useEffect(() => {
		updateHasContent();
	}, [files, updateHasContent]);

	const autoResize = useCallback(() => {
		const el = textareaRef.current;
		if (!el) return;
		el.style.height = "auto";
		el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
	}, []);

	useEffect(() => {
		if (!emojiOpen) return;
		const handler = (e: MouseEvent) => {
			if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
				setEmojiOpen(false);
			}
		};
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, [emojiOpen]);

	const handleFilesSelect = useCallback(
		async (selectedFiles: FileList | null) => {
			if (!selectedFiles) return;

			const currentLen = filesRef.current.length;
			const newFiles: PendingFile[] = [];
			for (let i = 0; i < Math.min(selectedFiles.length, 10 - currentLen); i++) {
				const file = selectedFiles[i];

				const baseType = file.type.split(";")[0].trim().toLowerCase();
				if (!ALLOWED_FILE_TYPES.includes(baseType)) {
					showError(`Недопустимый тип файла: ${file.name}`);
					continue;
				}
				if (file.size > MAX_FILE_SIZE) {
					showError(`Файл слишком большой: ${file.name} (макс. 50 МБ)`);
					continue;
				}

				const isVisual = file.type.startsWith("image/") || file.type.startsWith("video/");
				const preview = isVisual ? URL.createObjectURL(file) : undefined;
				newFiles.push({ id: `pf-${++fileIdCounter}`, file, preview, progress: 0, uploading: true });
			}

			setFiles((prev) => [...prev, ...newFiles]);

			for (const pf of newFiles) {
				try {
					const result = await uploadFile(pf.file, (progress) => {
						setFiles((prev) => prev.map((f) => (f.file === pf.file ? { ...f, progress } : f)));
					});
					setFiles((prev) =>
						prev.map((f) =>
							f.file === pf.file ? { ...f, key: result.key, uploading: false, progress: 100 } : f,
						),
					);
				} catch {
					setFiles((prev) =>
						prev.map((f) =>
							f.file === pf.file ? { ...f, uploading: false, error: "Ошибка загрузки" } : f,
						),
					);
				}
			}
		},
		[],
	);

	useEffect(() => {
		const handler = (e: Event) => {
			const detail = (e as CustomEvent<{ files: File[] }>).detail;
			if (detail.files.length > 0) {
				const dt = new DataTransfer();
				for (const f of detail.files) dt.items.add(f);
				handleFilesSelect(dt.files);
			}
		};
		window.addEventListener("chat-drop-files", handler);
		return () => window.removeEventListener("chat-drop-files", handler);
	}, [handleFilesSelect]);

	const removeFile = useCallback((id: string) => {
		setFiles((prev) => {
			const found = prev.find((p) => p.id === id);
			if (found?.preview) URL.revokeObjectURL(found.preview);
			return prev.filter((p) => p.id !== id);
		});
	}, []);

	const handleSubmit = useCallback(
		async (e?: React.FormEvent) => {
			e?.preventDefault();

			const currentEditState = editStateRef.current;

			if (currentEditState) {
				const content = textareaRef.current?.value.trim() ?? "";
				if (!content) return;
				if (content === currentEditState.message.content) {
					clearAllRef.current();
					if (textareaRef.current) {
						textareaRef.current.value = "";
						textareaRef.current.style.height = "auto";
					}
					setHasContent(false);
					return;
				}

				if (textareaRef.current) {
					textareaRef.current.value = "";
					textareaRef.current.style.height = "auto";
				}
				setHasContent(false);
				clearAllRef.current();

				await editMessageRef.current.mutateAsync({
					chatId: currentEditState.message.chatId,
					messageId: currentEditState.message.id,
					content,
				});
				textareaRef.current?.focus();
				return;
			}

			let chatId = activeChatIdRef.current;

			if (!chatId && onCreatePendingChatRef.current) {
				chatId = await onCreatePendingChatRef.current();
				if (!chatId) return;
			}

			if (!chatId || sendMessageRef.current.isPending) return;

			const currentFiles = filesRef.current;
			const uploadedKeys = currentFiles.filter((f) => f.key && !f.error).map((f) => f.key!);
			const content = textareaRef.current?.value.trim() ?? "";

			if (!content && uploadedKeys.length === 0) return;
			if (currentFiles.some((f) => f.uploading)) {
				showWarning("Дождитесь загрузки файлов");
				return;
			}

			const replyToId = replyStateRef.current?.message.id;

			if (textareaRef.current) {
				textareaRef.current.value = "";
				textareaRef.current.style.height = "auto";
			}
			setFiles([]);
			setHasContent(false);
			stopTypingRef.current();
			clearAllRef.current();

			await sendMessageRef.current.mutateAsync({
				chatId,
				content,
				mediaKeys: uploadedKeys.length > 0 ? uploadedKeys : undefined,
				replyTo: replyToId,
			});

			if (Math.random() < 0.005) {
				const audio = new Audio("/gun.mp3");
				audio.play().catch(() => {});
			}

			textareaRef.current?.focus();
		},
		[],
	);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === "Enter" && !e.shiftKey) {
				e.preventDefault();
				handleSubmit();
			}
			if (e.key === "Escape") {
				if (editStateRef.current) {
					clearAllRef.current();
					if (textareaRef.current) {
						textareaRef.current.value = "";
						textareaRef.current.style.height = "auto";
					}
					setHasContent(false);
				} else if (replyStateRef.current) {
					clearAllRef.current();
				}
			}
			if (e.key === "ArrowUp" && !editStateRef.current && !replyStateRef.current) {
				const val = textareaRef.current?.value ?? "";
				if (val.trim().length === 0) {
					const msgs = messagesRef.current;
					const uid = userIdRef.current;
					if (msgs && uid) {
						for (let i = msgs.length - 1; i >= 0; i--) {
							const m = msgs[i];
							if (m.senderId === uid && m.content && !m.deletedAt && !m._optimistic) {
								e.preventDefault();
								useMessageActionStore.getState().setEdit(m);
								break;
							}
						}
					}
				}
			}
		},
		[handleSubmit],
	);

	const handleInput = useCallback(() => {
		autoResize();
		updateHasContent();
		startTyping();
	}, [autoResize, updateHasContent, startTyping]);

	const handleFileInputChange = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			handleFilesSelect(e.target.files);
			e.target.value = "";
		},
		[handleFilesSelect],
	);

	const handleAttachClick = useCallback(() => {
		fileInputRef.current?.click();
	}, []);

	const handleEmojiSelect = useCallback(
		(emoji: { native: string }) => {
			const el = textareaRef.current;
			if (el) {
				const start = el.selectionStart;
				const end = el.selectionEnd;
				const before = el.value.slice(0, start);
				const after = el.value.slice(end);
				el.value = before + emoji.native + after;
				const cursor = start + emoji.native.length;
				el.setSelectionRange(cursor, cursor);
			}
			setEmojiOpen(false);
			textareaRef.current?.focus();
			updateHasContent();
			startTyping();
			requestAnimationFrame(autoResize);
		},
		[startTyping, autoResize, updateHasContent],
	);

	const handleToggleEmoji = useCallback(() => {
		setEmojiOpen((v) => !v);
	}, []);

	const isUploading = files.some((f) => f.uploading);

	const handleCancelAction = useCallback(() => {
		clearAll();
		if (editState) {
			if (textareaRef.current) {
				textareaRef.current.value = "";
				textareaRef.current.style.height = "auto";
			}
			setHasContent(false);
		}
	}, [clearAll, editState]);

	const isEditing = !!editState;

	return (
		<div className="relative border-t border-surface-border">
			<TypingIndicator chatId={activeChatId} />

			{replyState && (
				<div
					className="flex items-center gap-2 px-3 py-2 border-b border-surface-border bg-surface-elevated/50 animate-in slide-in-from-bottom-2 fade-in duration-150"
					role="status"
					aria-label={`Ответ на сообщение от ${replyState.senderName}`}
				>
					<Reply className="size-4 shrink-0 text-primary" />
					<div className="flex-1 min-w-0 flex items-center gap-2">
						<div className="w-0.5 self-stretch rounded-full bg-primary shrink-0" />
						<div className="min-w-0 flex-1">
							<span className="block text-xs font-semibold text-primary truncate">
								{replyState.senderName}
							</span>
							<span className="block text-xs text-muted-foreground truncate">
								{replyState.message.content || (replyState.message.media?.length ? "Медиа" : "Сообщение")}
							</span>
						</div>
					</div>
					<Tip label="Отменить (Esc)">
						<button
							type="button"
							onClick={handleCancelAction}
							className="flex size-6 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
							aria-label="Отменить ответ"
						>
							<X className="size-4" />
						</button>
					</Tip>
				</div>
			)}

			{editState && (
				<div
					className="flex items-center gap-2 px-3 py-2 border-b border-surface-border bg-surface-elevated/50 animate-in slide-in-from-bottom-2 fade-in duration-150"
					role="status"
					aria-label="Редактирование сообщения"
				>
					<Pencil className="size-4 shrink-0 text-primary" />
					<div className="flex-1 min-w-0 flex items-center gap-2">
						<div className="w-0.5 self-stretch rounded-full bg-primary shrink-0" />
						<div className="min-w-0 flex-1">
							<span className="block text-xs font-semibold text-primary">
								Редактирование
							</span>
							<span className="block text-xs text-muted-foreground truncate">
								{editState.message.content}
							</span>
						</div>
					</div>
					<Tip label="Отменить (Esc)">
						<button
							type="button"
							onClick={handleCancelAction}
							className="flex size-6 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
							aria-label="Отменить редактирование"
						>
							<X className="size-4" />
						</button>
					</Tip>
				</div>
			)}

			{files.length > 0 && (
				<FilePreviewGrid files={files} onRemove={removeFile} />
			)}

			<form onSubmit={handleSubmit} className="flex items-end gap-1 px-2 pt-2">
				<input
					ref={fileInputRef}
					type="file"
					accept={ALLOWED_FILE_TYPES.join(",")}
					multiple
					className="hidden"
					onChange={handleFileInputChange}
				/>
				<Tip label="Прикрепить файл">
					<button
						type="button"
						onClick={handleAttachClick}
						className="mb-0.5 flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground hover:bg-muted"
					>
						<Paperclip className="size-5" />
					</button>
				</Tip>

				<div className="relative flex-1">
					<textarea
						ref={textareaRef}
						onInput={handleInput}
						onBlur={stopTyping}
						onKeyDown={handleKeyDown}
						placeholder="Сообщение..."
						rows={1}
						className="min-h-[40px] w-full resize-none rounded-2xl bg-surface-elevated border border-surface-border px-4 py-2.5 pr-10 text-sm leading-snug text-foreground placeholder:text-surface-muted shadow-none ring-0 outline-none transition-colors focus:border-primary/30"
						style={{ maxHeight: 140 }}
					/>

					<div ref={emojiRef}>
						<Tip label="Эмодзи">
							<button
								type="button"
								onClick={handleToggleEmoji}
								className={cn(
									"absolute right-2.5 bottom-2.5 flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground",
									emojiOpen && "text-primary",
								)}
							>
								<Smile className="size-5" />
							</button>
						</Tip>

						{emojiOpen && (
							<div className="absolute right-0 bottom-full mb-2 z-50">
								<Picker
									data={data}
									i18n={i18n}
									onEmojiSelect={handleEmojiSelect}
									theme={resolvedTheme === "dark" ? "dark" : "light"}
									previewPosition="none"
									skinTonePosition="search"
									locale="ru"
									maxFrequentRows={2}
								/>
							</div>
						)}
					</div>
				</div>

				<Tip label={isEditing ? "Сохранить (Enter)" : "Отправить (Enter)"} side="top">
				<button
					type="submit"
					disabled={!hasContent || sendMessage.isPending || editMessage.isPending || isUploading}
					className={cn(
						"mb-0.5 flex size-9 shrink-0 items-center justify-center rounded-full transition-all duration-200 disabled:pointer-events-none",
						hasContent && !isUploading
							? "bg-primary text-primary-foreground hover:bg-primary/90"
							: "text-muted-foreground opacity-40",
					)}
					aria-label={isEditing ? "Сохранить изменения" : "Отправить сообщение"}
				>
					{isUploading ? (
						<Loader2 className="size-5 animate-spin" />
					) : isEditing ? (
						<Check className="size-5" />
					) : (
						<SendHorizonal className="size-5" />
					)}
				</button>
				</Tip>
			</form>
		</div>
	);
});
