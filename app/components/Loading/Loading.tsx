"use client";

import { ReactElement, useEffect, useRef } from "react";
import pusher from "@/lib/pusher/client-connection";
import styles from "./Loading.module.css";
import { useData, useNotifications } from "@/lib/store";
import { usePathname } from "next/navigation";

type TRelationData = {
    type: "FRIEND_ADDED" | "FRIEND_REMOVED" | "REQUEST_SENT";
    sender: TCleanUser;
    receiver: TCleanUser;
};

type TChannelData = {
    type: "CHANNEL_ADDED" | "CHANNEL_REMOVED" | "RECIPIENT_ADDED" | "RECIPIENT_REMOVED";
    channel: TChannel;
    channelId?: TChannel["id"];
    recipientId?: TCleanUser["id"];
    recipientIds?: TCleanUser["id"][];
};

type TGuildData = {
    type: "GUILD_ADDED" | "GUILD_REMOVED";
    guild: TGuild;
};

type TMessageData = {
    channelId: TChannel["id"];
    message: TMessage;
};

type Props = {
    children: ReactElement;
    data: {
        user: TCleanUser;
        friends: TCleanUser[];
        blocked: TCleanUser[];
        blockedBy: TCleanUser[];
        received: TCleanUser[];
        sent: TCleanUser[];
        channels: TChannel[];
        guilds: TGuild[];
    };
};

export const Loading = ({ children, data }: Props): ReactElement => {
    const setReceived = useData((state) => state.setRequestsReceived);
    const setBlockedBy = useData((state) => state.setBlockedBy);
    const setSent = useData((state) => state.setRequestsSent);
    const setChannels = useData((state) => state.setChannels);
    const setFriends = useData((state) => state.setFriends);
    const setBlocked = useData((state) => state.setBlocked);
    const setGuilds = useData((state) => state.setGuilds);
    const setToken = useData((state) => state.setToken);
    const setUser = useData((state) => state.setUser);

    const addRequestReceived = useData((state) => state.addRequestReceived);
    const removeBlockedBy = useData((state) => state.removeBlockedBy);
    const removeRequests = useData((state) => state.removeRequests);
    const addRequestSent = useData((state) => state.addRequestSent);
    const removeBlocked = useData((state) => state.removeBlocked);
    const removeFriend = useData((state) => state.removeFriend);
    const addBlockedBy = useData((state) => state.addBlockedBy);
    const addBlocked = useData((state) => state.addBlocked);
    const addFriend = useData((state) => state.addFriend);

    const updateChannel = useData((state) => state.updateChannel);
    const removeChannel = useData((state) => state.removeChannel);
    const moveChannelUp = useData((state) => state.moveChannelUp);
    const removeGuild = useData((state) => state.removeGuild);
    const addChannel = useData((state) => state.addChannel);
    const addGuild = useData((state) => state.addGuild);

    const addPing = useNotifications((state) => state.addPing);

    const channels = useData((state) => state.channels);
    const guilds = useData((state) => state.guilds);

    const token = useData((state) => state.token);
    const user = useData((state) => state.user);

    const hasRendered = useRef(false);
    const pathname = usePathname();

    useEffect(() => {
        const env = process.env.NODE_ENV;

        const setAuthContext = async () => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/refresh`, {
                method: "GET",
                credentials: "include",
            }).then((res) => res.json());

            if (response.token) {
                setUser(data.user);
                setToken(response.token);
                setFriends(data.friends);
                setBlocked(data.blocked);
                setBlockedBy(data.blockedBy);
                setReceived(data.received);
                setSent(data.sent);
                setChannels(data.channels);
                setGuilds(data.guilds);
            }
        };

        if (env == "development") {
            if (hasRendered.current) setAuthContext();
            return () => {
                hasRendered.current = true;
            };
        } else if (env == "production") {
            setAuthContext();
        }
    }, []);

    useEffect(() => {
        if (!user) return;

        pusher.bind("message-sent", (data: TMessageData) => {
            if (channels.map((c) => c.id).includes(data.channelId)) {
                moveChannelUp(data.channelId);

                if (pathname.includes(data.channelId) || data.message.authorId === user.id) return;
                addPing(data.channelId);

                const audio = new Audio("/assets/sounds/ping.mp3");
                audio.volume = 0.5;
                audio.play();
            }
        });

        pusher.bind("user-relation", (data: TRelationData) => {
            if (data.receiver.id === user.id || data.sender.id === user.id) {
                const toAdd = data.receiver.id === user.id ? data.sender : data.receiver;

                if (data.type === "FRIEND_ADDED") {
                    removeRequests(toAdd);
                    addFriend(toAdd);
                } else if (data.type === "FRIEND_REMOVED") {
                    removeRequests(toAdd);
                    removeFriend(toAdd);
                } else if (data.type === "REQUEST_SENT") {
                    if (data.receiver.id === user.id) {
                        addRequestReceived(toAdd);
                    } else {
                        addRequestSent(toAdd);
                    }
                } else if (data.type === "USER_BLOCKED") {
                    if (data.receiver.id === user.id) {
                        addBlockedBy(toAdd);
                    } else {
                        addBlocked(toAdd);
                    }
                } else if (data.type === "USER_UNBLOCKED") {
                    if (data.receiver.id === user.id) {
                        removeBlockedBy(toAdd);
                    } else {
                        removeBlocked(toAdd);
                    }
                }
            }
        });

        pusher.bind("channel-update", (data: TChannelData) => {
            if (data.channel.recipientIds.includes(user.id)) {
                if (data.type === "CHANNEL_REMOVED") {
                    removeChannel(data.channel);
                } else if (data.type === "CHANNEL_ADDED") {
                    addChannel(data.channel);
                } else if (data.type === "RECIPIENT_ADDED" || data.type === "RECIPIENT_REMOVED") {
                    updateChannel(data.channel);
                }
            }
        });

        pusher.bind("guild-update", (data: TGuildData) => {
            if (data.guild.rawMemberIds.includes(user.id)) {
                if (data.type === "GUILD_REMOVED") {
                    removeGuild(data.guild);
                } else if (data.type === "GUILD_ADDED") {
                    addGuild(data.guild);
                }
            }
        });

        return () => {
            pusher.unbind("user-relation");
            pusher.unbind("channel-update");
            pusher.unbind("guild-update");
            pusher.unbind("message-sent");
        };
    }, [user, channels, guilds, pathname]);

    return (
        <div
            onDrag={(e) => e.preventDefault()}
            onDragEnd={(e) => e.preventDefault()}
            onDragOver={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
            onContextMenu={(e) => e.preventDefault()}
        >
            {token ? (
                children
            ) : (
                <div className={styles.container}>
                    <video
                        autoPlay
                        loop
                    >
                        <source
                            src="/assets/app/spinner.webm"
                            type="video/webm"
                        />
                    </video>

                    <div className={styles.textContent}>
                        <div className="smallTitle">Did you know</div>
                        <div>
                            Use{" "}
                            <div className="keybind">
                                <span>CTRL /</span>
                            </div>{" "}
                            to bring up the list of keyboard shortcuts.
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
