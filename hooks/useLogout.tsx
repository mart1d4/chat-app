"use client";

import { useData, useShowSettings } from "@/lib/store";
import { useRouter } from "next/navigation";

const useLogout = () => {
    const setShowSettings = useShowSettings((state) => state.setShowSettings);
    const channels = useData((state) => state.channels);
    const reset = useData((state) => state.reset);
    const router = useRouter();

    const logout = async () => {
        const channelIds = channels.map((channel) => channel.id);

        try {
            await fetch("/api/auth/logout", {
                method: "POST",
                credentials: "include",
            }).then(() => {
                reset();
                setShowSettings(null);
                router.refresh();
            });
        } catch (error) {
            console.error(error);
            throw new Error("Error logging out");
        }
    };

    return { logout };
};

export default useLogout;
