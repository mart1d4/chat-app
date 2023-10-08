"use client";

import { useData } from "@/lib/store";

export default function useRefreshToken() {
    const setToken = useData((state) => state.setToken);
    const setUser = useData((state) => state.setUser);

    const refresh = async () => {
        const response = await fetch("/api/auth/refresh", {
            method: "GET",
            credentials: "include",
        }).then((res) => res.json());

        if (!response.success) {
            return null;
        }

        setToken(response.accessToken);
        setUser(response.user);

        return response.accessToken;
    };

    return refresh;
}
