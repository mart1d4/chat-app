"use client";

import { useData, useShowSettings } from "@/lib/store";
import { useRouter } from "next/navigation";

const useLogout = () => {
    const setShowSettings = useShowSettings((state) => state.setShowSettings);
    const removeData = useData((state) => state.removeData);
    const channels = useData((state) => state.channels);
    const router = useRouter();

    const logout = async () => {
        const channelIds = channels.map((channel: TChannel) => channel.id);

        try {
            await fetch("/api/auth/logout", {
                method: "POST",
                credentials: "include",
            }).then(() => {
                localStorage.removeItem("channel-url");
                localStorage.removeItem("friends-tab");
                localStorage.removeItem("user-settings");

                channelIds.forEach((channelId: string) => {
                    localStorage.removeItem(`channel-${channelId}`);
                });

                removeData();
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
