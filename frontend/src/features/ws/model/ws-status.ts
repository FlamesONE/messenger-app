import { create } from "zustand";

export type WsStatus = "disconnected" | "connecting" | "authenticating" | "connected" | "error";

interface WsStatusState {
	status: WsStatus;
	setStatus: (status: WsStatus) => void;
}

export const useWsStatus = create<WsStatusState>()((set) => ({
	status: "disconnected",
	setStatus: (status) => set({ status }),
}));
