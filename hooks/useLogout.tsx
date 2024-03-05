"use client";

import { useData, useShowSettings } from "@/lib/store";
import { useRouter } from "next/navigation";

export default function useLogout() {
    const setShowSettings = useShowSettings((state) => state.setShowSettings);
    const reset = useData((state) => state.reset);
    const router = useRouter();

    async function logout() {
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
    }

    return { logout };
}
