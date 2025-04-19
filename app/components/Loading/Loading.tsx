"use client";

import { useChannelSettings, useGuildSettings } from "@/store/settings";
import { useActiveVoice, useData, useShowChannels } from "@/store";
import { sendBrowserNotification } from "@/lib/notifications";
import { useNotifications } from "@/store/notifications";
import { usePathname, useRouter } from "next/navigation";
import { getApiUrl, getCdnUrl } from "@/lib/uploadthing";
import { memo, useEffect, useMemo, useRef } from "react";
import { getFullChannel } from "@/lib/strings";
import { getRandomImage } from "@/lib/utils";
import { useSocket } from "@/store/socket";
import { isStillMuted } from "@/lib/mute";
import { AppSpinner } from "./Spinner";
import Pusher from "pusher-js";
import type {
    DMChannelWithRecipients,
    ChannelRecipient,
    GuildChannel,
    UnknownUser,
    GuildMember,
    UserGuild,
    KnownUser,
    AppUser,
    GuildRole,
} from "@/type";

const PUSHER_KEY = process.env.NEXT_PUBLIC_PUSHER_KEY;
const DISABLE_PUSHER = false;

if (!PUSHER_KEY) {
    throw new Error("PUSHER_KEY is not defined");
}

export const Loading = memo(function Loading({
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
        rooms: {
            channelId: number;
            guildId: number | null;
            roomName: string;
            participants: number[];
            started: number;
            startedBy: number;
            hasJoined: number | null;
            haveDismissed: number[];
        }[];
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
        updateGuildChannel,
        updateGuildMember,
        setFriendsStatus,
        setOnlineMembers,
        addGuildChannel,
        addOnlineMember,
        updateGuildRole,
        removeGuildRole,
        moveChannelUp,
        updateChannel,
        removeChannel,
        addGuildRole,
        removeMember,
        setReceived,
        updateGuild,
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

    const { setRooms, addRoom, removeRoom, addParticipant, removeParticipant, addDismissed } =
        useActiveVoice();
    const { guilds: guildsSettings } = useGuildSettings();
    const { addNotification } = useNotifications();
    const { setShowChannels } = useShowChannels();
    const { socket, setSocket } = useSocket();
    const { muted } = useChannelSettings();
    const pathname = usePathname();
    const router = useRouter();

    const guildsSettingsRef = useRef(guildsSettings);
    const pathnameRef = useRef(pathname);
    const hasLoaded = useRef(false);
    const mutedRef = useRef(muted);

    if (mutedRef.current !== muted) {
        mutedRef.current = muted;
    }

    if (guildsSettingsRef.current !== guildsSettings) {
        guildsSettingsRef.current = guildsSettings;
    }

    if (pathnameRef.current !== pathname) {
        pathnameRef.current = pathname;
    }

    if (!hasLoaded.current) {
        setUser(data.user);
        setFriends(data.friends);
        setBlocked(data.blocked);
        setReceived(data.received);
        setSent(data.sent);
        setChannels(data.channels);
        setGuilds(data.guilds);
        setRooms(data.rooms);
        hasLoaded.current = true;
    }

    useEffect(() => {
        if (!user || DISABLE_PUSHER) return;

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

                const fullChannel = getFullChannel(channel, user);
                if (!fullChannel) return;

                let icon = fullChannel.icon;

                if (!icon) {
                    if (channel.type === 1) {
                        icon = getRandomImage(channel.id, "icon");
                    } else {
                        const friend = channel.recipients.find((r) => r.id !== userId);
                        if (friend) {
                            icon = getRandomImage(friend.id, "avatar");
                        }
                    }
                }

                sendBrowserNotification(
                    fullChannel.name,
                    `You have a new message in ${fullChannel.name}`,
                    fullChannel.icon ? `${getCdnUrl}${icon}` : icon
                );
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

        chan.bind("livekit", ({ event, data }: { event: string; data: any }) => {
            if (event === "roomStarted") {
                addRoom({
                    ...data,
                    hasJoined: data.startedBy === userId ? Date.now() / 1000 : null,
                    haveDismissed: [],
                });
            } else if (event === "roomFinished") {
                removeRoom(data.channelId);
            } else if (event === "participantJoined") {
                addParticipant(data.channelId, data.joined);
            } else if (event === "participantLeft") {
                removeParticipant(data.channelId, data.left);
            } else if (event === "userDismissed") {
                addDismissed(data.channelId, data.dismissed);
            }
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

        chan.bind("guild-update", ({ updates }: { updates: Partial<UserGuild> }) => {
            updateGuild(guild.id, updates);
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

                    sendBrowserNotification(
                        `New message in ${guild.name}`,
                        `You have a new message in ${guild.name}`
                    );
                }
            }
        );

        chan.bind("channel-add", ({ channel }: { channel: GuildChannel }) => {
            addGuildChannel(guild.id, channel);
        });

        chan.bind(
            "channel-update",
            ({ channelId, updates }: { channelId: number; updates: Record<string, any> }) => {
                updateGuildChannel(guild.id, channelId, updates);
            }
        );

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

        chan.bind("role-add", ({ role }: { role: GuildRole }) => {
            addGuildRole(guild.id, role);
        });

        chan.bind(
            "role-update",
            ({ roleId, updates }: { roleId: number; updates: Partial<GuildRole> }) => {
                updateGuildRole(guild.id, roleId, updates);
            }
        );

        chan.bind("role-remove", ({ roleId }: { roleId: number }) => {
            removeGuildRole(guild.id, roleId);
        });

        chan.bind(
            "member-update",
            ({ memberId, updates }: { memberId: number; updates: Partial<GuildMember> }) => {
                updateGuildMember(guild.id, memberId, updates);
            }
        );

        chan.bind("member-remove", ({ memberId }: { memberId: number }) => {
            if (memberId === userId) {
                removeGuild(guild.id);
                socket.unsubscribe(`private-guild-${guild.id}`);

                if (pathnameRef.current.includes(guild.id.toString())) {
                    setShowChannels(true);
                    router.push("/channels/me");
                }
            } else {
                removeMember(guild.id, memberId);
            }
        });

        chan.bind("livekit", ({ event, data }: { event: string; data: any }) => {
            if (event === "roomStarted") {
                addRoom({
                    ...data,
                    hasJoined: false,
                    haveDismissed: [],
                });
            } else if (event === "roomFinished") {
                removeRoom(data.channelId);
            } else if (event === "participantJoined") {
                addParticipant(data.channelId, data.joined);
            } else if (event === "participantLeft") {
                removeParticipant(data.channelId, data.left);
            } else if (event === "userDismissed") {
                addDismissed(data.channelId, data.dismissed);
            }
        });
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

                    sendBrowserNotification(
                        `New friend request from ${user.username}`,
                        `You have a new friend request from ${user.username}`
                    );
                }
            }
        );

        userChannel.bind(
            "join-group",
            ({
                channel,
                moveTo,
                addPing,
            }: {
                channel: DMChannelWithRecipients;
                moveTo?: number;
                addPing?: boolean;
            }) => {
                addChannel(channel);
                subToChannel(socket, channel);
                otherChannelsSubs.push(channel.id);

                if (moveTo === user.id) {
                    setShowChannels(false);
                    router.push(`/channels/me/${channel.id}`);
                }

                if (addPing) {
                    const audio = new Audio("/assets/sounds/ping.mp3");
                    audio.volume = 0.5;
                    audio.play();

                    sendBrowserNotification(
                        `New message in ${channel.name}`,
                        `You have a new message in ${channel.name}`
                    );
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

    const content = useMemo(
        () => <div onContextMenu={(e) => e.preventDefault()}>{children}</div>,
        [children]
    );

    if (!user) return <AppSpinner />;
    return content;
});
