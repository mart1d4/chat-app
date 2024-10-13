"use client";

import { Channels, Guilds, Users } from "@/lib/db/types";
import { AppSpinner } from "./Spinner";
import { useData } from "@/store";
import { useEffect } from "react";

export function Loading({
    children,
    data,
}: {
    children: React.ReactNode;
    data: {
        user: Partial<Users>;
        friends: Partial<Users>[];
        blocked: Partial<Users>[];
        received: Partial<Users>[];
        sent: Partial<Users>[];
        channels: Partial<Channels>[];
        guilds: Partial<Guilds>[];
    };
}) {
    const setReceived = useData((state) => state.setReceived);
    const setChannels = useData((state) => state.setChannels);
    const setFriends = useData((state) => state.setFriends);
    const setBlocked = useData((state) => state.setBlocked);
    const setGuilds = useData((state) => state.setGuilds);
    const setSent = useData((state) => state.setSent);
    const setUser = useData((state) => state.setUser);
    const user = useData((state) => state.user);

    useEffect(() => {
        setUser(data.user);
        setFriends(data.friends);
        setBlocked(data.blocked);
        setReceived(data.received);
        setSent(data.sent);
        setChannels(data.channels);
        setGuilds(data.guilds);
    }, []);

    if (user) return children;
    return <AppSpinner />;
}
