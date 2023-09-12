"use client";

import { useRouter } from "next/navigation";
import useContextHook from "./useContextHook";
import { useData } from "@/lib/store";

const useLogout = () => {
    const { setShowSettings }: any = useContextHook({ context: "layer" });
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
                setShowSettings(false);
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
