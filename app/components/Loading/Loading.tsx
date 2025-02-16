"use client";

import { useChannelSettings, useGuildSettings } from "@/store/settings";
import { useNotifications } from "@/store/notifications";
import { usePathname, useRouter } from "next/navigation";
import { getApiUrl } from "@/lib/uploadthing";
import { useSocket } from "@/store/socket";
import { useEffect, useRef } from "react";
import { isStillMuted } from "@/lib/mute";
import { AppSpinner } from "./Spinner";
import { useData, useShowChannels } from "@/store";
import Pusher from "pusher-js";
import type {
    DMChannelWithRecipients,
    ChannelRecipient,
    UnknownUser,
    GuildMember,
    UserGuild,
    KnownUser,
    AppUser,
    GuildChannel,
} from "@/type";

const PUSHER_KEY = process.env.NEXT_PUBLIC_PUSHER_KEY;

if (!PUSHER_KEY) {
    throw new Error("PUSHER_KEY is not defined");
}

export function Loading({
    children,
    data,
}: {
    children: React.ReactNode;
    data: {
        user: AppUser;
        friends: KnownUser[];
        blocked: UnknownUser[];
        received: KnownUser[];
        sent: KnownUser[];
        channels: DMChannelWithRecipients[];
        guilds: UserGuild[];
    };
}) {
    const {
        removeChannelRecipient,
        removeOnlineRecipient,
        setOnlineRecipients,
        addChannelRecipient,
        removeGuildChannel,
        addOnlineRecipient,
        removeOnlineMember,
        setFriendsStatus,
        setOnlineMembers,
        addGuildChannel,
        addOnlineMember,
        moveChannelUp,
        updateChannel,
        removeChannel,
        setReceived,
        setChannels,
        removeGuild,
        setFriends,
        setBlocked,
        addChannel,
        removeUser,
        setGuilds,
        addGuild,
        channels,
        setSent,
        setUser,
        addUser,
        guilds,
        user,
    } = useData();

    const { guilds: guildsSettings } = useGuildSettings();
    const { addNotification } = useNotifications();
    const { setShowChannels } = useShowChannels();
    const { socket, setSocket } = useSocket();
    const { muted } = useChannelSettings();
    const pathname = usePathname();
    const router = useRouter();

    const guildsSettingsRef = useRef(guildsSettings);
    const pathnameRef = useRef(pathname);
    const mutedRef = useRef(muted);

    useEffect(() => {
        mutedRef.current = muted;
        guildsSettingsRef.current = guildsSettings;
    }, [muted, guildsSettings]);

    useEffect(() => {
        pathnameRef.current = pathname;
    }, [pathname]);

    useEffect(() => {
        setUser(data.user);
        setFriends(data.friends);
        setBlocked(data.blocked);
        setReceived(data.received);
        setSent(data.sent);
        setChannels(data.channels);
        setGuilds(data.guilds);
    }, []);

    useEffect(() => {
        if (!user) return;

        // Pusher.logToConsole = true;

        const pusher = new Pusher(PUSHER_KEY, {
            cluster: "eu",
            userAuthentication: {
                endpoint: `${getApiUrl}/auth/pusher`,
                transport: "ajax",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            },
            channelAuthorization: {
                endpoint: `${getApiUrl}/auth/pusher`,
                transport: "ajax",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            },
        });

        pusher.bind("pusher:signin_success", () => {
            console.log("Pusher: Signin success");
            setSocket(pusher);
        });

        pusher.bind("pusher:error", (e: any) => {
            console.error("Pusher: Error", e);
        });

        pusher.signin();

        const watchlistEventHandler = (event: {
            name: "offline" | "online";
            user_ids: string[];
        }) => {
            if (event.name === "offline") {
                const offlineUsers = event.user_ids.map((id) => Number(id));
                setFriendsStatus(offlineUsers, "offline");
            } else if (event.name === "online") {
                const onlineUsers = event.user_ids.map((id) => Number(id));
                setFriendsStatus(onlineUsers, "online");
            }
        };

        pusher.user.watchlist.bind("online", watchlistEventHandler);
        pusher.user.watchlist.bind("offline", watchlistEventHandler);

        return () => {
            pusher.disconnect();
            setSocket(null);
        };
    }, [user]);

    function subToChannel(socket: Pusher, channel: DMChannelWithRecipients) {
        const chan = socket.subscribe(`private-channel-${channel.id}`);
        const presence = socket.subscribe(`presence-channel-${channel.id}`);
        const userId = Number(socket.user.user_data?.id);

        presence.bind(
            "pusher:subscription_succeeded",
            ({
                members,
            }: {
                members: {
                    [key: string]: KnownUser;
                };
            }) => {
                setOnlineRecipients(channel.id, Object.keys(members).map(Number));
            }
        );

        presence.bind("pusher:member_added", ({ info: user }: { info: KnownUser }) => {
            addOnlineRecipient(channel.id, { ...user, id: Number(user.id) });
        });

        presence.bind("pusher:member_removed", ({ id }: { id: string }) => {
            removeOnlineRecipient(channel.id, Number(id));
        });

        chan.bind("message", ({ ignore, mentioned }: { ignore: number; mentioned: number[] }) => {
            const isMuted = mutedRef.current.find(
                (m) => m.channelId === channel.id && isStillMuted(m.duration, m.started)
            );

            moveChannelUp(channel.id);
            if (ignore === userId || pathnameRef.current.includes(channel.id)) return;

            const hasPing = [0, 1].includes(channel.type) || mentioned.includes(userId);

            addNotification(channel.id, hasPing);

            if (hasPing && !isMuted) {
                const audio = new Audio("/assets/sounds/ping.mp3");
                audio.volume = 0.5;
                audio.play();
            }
        });

        chan.bind("arrival", ({ recipient }: { recipient: ChannelRecipient }) => {
            if (recipient.id === userId) return;
            addChannelRecipient(channel.id, recipient);
        });

        chan.bind("departure", ({ recipientId }: { recipientId: number }) => {
            if (recipientId === userId) {
                removeChannel(channel.id);
                socket.unsubscribe(`private-channel-${channel.id}`);

                if (pathnameRef.current.includes(channel.id.toString())) {
                    setShowChannels(true);
                    router.push("/channels/me");
                }
            } else {
                if (channel.type === 0) return;
                removeChannelRecipient(channel.id, recipientId);
            }
        });

        chan.bind("update", (data: Partial<DMChannelWithRecipients>) => {
            updateChannel(channel.id, data);
        });
    }

    function subToGuild(socket: Pusher, guild: UserGuild) {
        const presence = socket.subscribe(`presence-guild-${guild.id}`);
        const chan = socket.subscribe(`private-guild-${guild.id}`);
        const userId = Number(socket.user.user_data?.id);

        presence.bind(
            "pusher:subscription_succeeded",
            ({
                members,
            }: {
                members: {
                    [key: string]: GuildMember;
                };
            }) => {
                setOnlineMembers(
                    guild.id,
                    Object.values(members).map((m) => ({
                        ...m,
                        id: Number(m.id),
                        permissions: BigInt(m.permissions),
                    }))
                );
            }
        );

        presence.bind("pusher:member_added", ({ info: user }: { info: GuildMember }) => {
            addOnlineMember(guild.id, {
                ...user,
                id: Number(user.id),
                permissions: BigInt(user.permissions),
            });
        });

        presence.bind("pusher:member_removed", ({ id }: { id: string }) => {
            removeOnlineMember(guild.id, Number(id));
        });

        chan.bind(
            "message",
            ({
                ignore,
                mentioned,
                channelId,
            }: {
                ignore: number;
                mentioned: number[];
                channelId: number;
            }) => {
                const isMuted = guildsSettingsRef.current[guild.id]?.isMuted;

                if (ignore === userId || pathnameRef.current.includes(channelId.toString())) return;

                const hasPing = mentioned.includes(userId);

                addNotification(channelId, hasPing, guild.id);

                if (hasPing && !isMuted) {
                    const audio = new Audio("/assets/sounds/ping.mp3");
                    audio.volume = 0.5;
                    audio.play();
                }
            }
        );

        chan.bind("channel-add", ({ channel }: { channel: GuildChannel }) => {
            addGuildChannel(guild.id, channel);
        });

        chan.bind(
            "channel-remove",
            ({ channelId, guildId }: { channelId: number; guildId: number }) => {
                if (pathnameRef.current.includes(channelId.toString())) {
                    const guild = guilds.find((g) => g.id === guildId);

                    const channel =
                        guild?.channels.find((c) => c.type === 2) ||
                        guild?.channels.find((c) => c.type === 3);

                    setShowChannels(true);
                    router.push(
                        `/channels/${guildId}/${guild?.systemChannelId || channel?.id || ""}`
                    );
                }

                removeGuildChannel(guild.id, channelId);
            }
        );
    }

    useEffect(() => {
        if (!socket || !user) return;

        const otherChannelsSubs: number[] = [];
        const otherGuildsSubs: number[] = [];

        data.channels.forEach((channel) => subToChannel(socket, channel));
        data.guilds.forEach((guild) => subToGuild(socket, guild));

        const userChannel = socket.subscribe(`private-user-${user.id}`);

        userChannel.bind(
            "relationship",
            ({
                type,
                user,
            }: {
                type: "friends" | "received" | "sent" | "blocked";
                user: KnownUser | UnknownUser | number;
            }) => {
                if (typeof user === "number") {
                    removeUser(user, type);
                } else {
                    addUser(user, type);
                }

                if (type === "received" && typeof user !== "number") {
                    const audio = new Audio("/assets/sounds/ping.mp3");
                    audio.volume = 0.5;
                    audio.play();
                }
            }
        );

        userChannel.bind(
            "join-group",
            ({ channel, moveTo }: { channel: DMChannelWithRecipients; moveTo?: number }) => {
                addChannel(channel);
                subToChannel(socket, channel);
                otherChannelsSubs.push(channel.id);

                if (moveTo === user.id) {
                    setShowChannels(false);
                    router.push(`/channels/me/${channel.id}`);
                }
            }
        );

        userChannel.bind(
            "join-guild",
            ({ guild, redirect }: { guild: UserGuild; redirect: number }) => {
                addGuild(guild);
                subToGuild(socket, guild);
                otherGuildsSubs.push(guild.id);

                if (redirect === user.id) {
                    setShowChannels(false);
                    router.push(`/channels/${guild.id}/${guild.systemChannelId}`);
                }
            }
        );

        userChannel.bind("leave-guild", ({ guildId }: { guildId: number }) => {
            removeGuild(guildId);
            socket.unsubscribe(`private-guild-${guildId}`);

            if (pathnameRef.current.includes(guildId.toString())) {
                setShowChannels(true);
                router.push("/channels/me");
            }
        });

        return () => {
            channels.forEach((channel) => {
                socket.unsubscribe(`private-channel-${channel.id}`);
            });

            otherChannelsSubs.forEach((channelId) => {
                socket.unsubscribe(`private-channel-${channelId}`);
            });

            guilds.forEach((guild) => {
                socket.unsubscribe(`private-guild-${guild.id}`);
            });

            otherGuildsSubs.forEach((guildId) => {
                socket.unsubscribe(`private-guild-${guildId}`);
            });

            socket.unsubscribe(`private-user-${user.id}`);
        };
    }, [socket]);

    if (!user) return <AppSpinner />;
    return <div onContextMenu={(e) => e.preventDefault()}>{children}</div>;
}
