import data from "@emoji-mart/data";
import i18n from "@emoji-mart/data/i18n/ru.json";
import Picker from "@emoji-mart/react";
import { forwardRef } from "react";

interface EmojiPickerOverlayProps {
	anchorPos: { x: number; y: number } | null;
	isMine: boolean;
	theme: string;
	onSelect: (emoji: { native: string }) => void;
	onClose: () => void;
}

const PICKER_W = 352;
const PICKER_H = 400;

export const EmojiPickerOverlay = forwardRef<HTMLDivElement, EmojiPickerOverlayProps>(
	function EmojiPickerOverlay({ anchorPos, isMine, theme, onSelect, onClose }, ref) {
		const vw = window.innerWidth;
		const vh = window.innerHeight;

		let left = anchorPos ? anchorPos.x : vw / 2 - PICKER_W / 2;
		let top = anchorPos ? anchorPos.y - PICKER_H - 8 : vh / 2 - PICKER_H / 2;

		if (isMine && anchorPos) {
			left = anchorPos.x - PICKER_W;
		}

		if (left + PICKER_W > vw - 8) left = vw - PICKER_W - 8;
		if (left < 8) left = 8;
		if (top < 8) top = anchorPos ? anchorPos.y + 8 : 8;
		if (top + PICKER_H > vh - 8) top = vh - PICKER_H - 8;

		return (
			<>
				<div
					className="fixed inset-0 z-[100]"
					onClick={onClose}
				/>
				<div
					ref={ref}
					className="fixed z-[101] animate-in fade-in zoom-in-95 duration-150 rounded-xl overflow-hidden shadow-2xl"
					style={{ top, left }}
				>
					<Picker
						data={data}
						i18n={i18n}
						onEmojiSelect={onSelect}
						theme={theme}
						previewPosition="none"
						skinTonePosition="search"
						locale="ru"
						maxFrequentRows={2}
						perLine={8}
					/>
				</div>
			</>
		);
	},
);
