import type Pusher from "pusher-js";
import { create } from "zustand";

interface socketState {
    socket: Pusher | null;
    setSocket: (socket: Pusher | null) => void;
}

export const useSocket = create<socketState>((set) => ({
    socket: null,
    setSocket: (socket) => set({ socket }),
}));
