"use client";

import { useRef, useEffect, useMemo, type RefObject, useState, useLayoutEffect } from "react";
import { Message, TextArea, MessageSk, Avatar, LoadingDots } from "@components";
import type { DMChannel, Guild, KnownUser, ResponseMessage } from "@/type";
import { useAuthenticatedUser } from "@/hooks/useAuthenticatedUser";
import { isInline, isLarge, isNewDay } from "@/lib/message";
import { useIntersection } from "@/hooks/useIntersection";
import type { SWRInfiniteKeyLoader } from "swr/infinite";
import { useNotifications } from "@/store/notifications";
import useFetchHelper from "@/hooks/useFetchHelper";
import { getCdnUrl } from "@/lib/uploadthing";
import { useData, useUrls } from "@/store";
import styles from "./Channels.module.css";
import { useSocket } from "@/store/socket";
import useSWRInfinite from "swr/infinite";
import fetchHelper from "@/hooks/useSwr";
import { getDayDate } from "@/lib/time";
import Image from "next/image";

const LIMIT = 50;

export default function Content({ channelId }: { channelId: number }) {
    const [isAtBottom, setIsAtBottom] = useState(true);

    const channel = useData((state) => state.channels).find((c) => c.id === channelId);
    const user = useAuthenticatedUser();

    if (!channel) return null;

    const friend = channel.type === 0 ? channel.recipients.find((r) => r.id !== user!.id) : null;

    const getKey: SWRInfiniteKeyLoader = (_, previousData) => {
        const baseUrl = `/channels/${channel.id}/messages?limit=`;

        if (previousData) {
            if (previousData.length < LIMIT) {
                return null;
            }

            const last = previousData[previousData.length - 1];
            return `${baseUrl}${LIMIT}&before=${last.createdAt}`;
        }

        return `${baseUrl}${LIMIT}`;
    };

    const { data, isLoading, mutate, size, setSize } = useSWRInfinite<ResponseMessage[], Error>(
        getKey,
        fetchHelper().request,
        {
            errorRetryCount: 0,
            revalidateIfStale: true,
            revalidateOnFocus: false,
            revalidateOnReconnect: true,
        }
    );

    const messages = useMemo(
        () =>
            data
                ? data
                      .flat()
                      .reverse()
                      .map((m) => ({
                          ...m,
                          createdAt: new Date(m.createdAt).toISOString(),
                      }))
                : [],
        [data]
    );
    const hasMore = useMemo(() => (data ? data[data.length - 1].length === LIMIT : false), [data]);

    const skeletonEl = useRef<HTMLDivElement>(null);
    const scrollEl = useRef<HTMLDivElement>(null);
    const spacerEl = useRef<HTMLDivElement>(null);

    const shouldLoad = useIntersection(skeletonEl as RefObject<HTMLDivElement>, -200);
    const setChannelUrl = useUrls((state) => state.setMe);
    const { removeNotification } = useNotifications();
    const { socket } = useSocket();

    useEffect(() => {
        if (!socket) return;

        const chan = socket.subscribe(`private-channel-${channel.id}-receive`);
        const userId = Number(socket.user.user_data?.id);

        chan.bind("message-received", ({ message }: { message: ResponseMessage }) => {
            if (message.author.id === userId && !isInline(message.type)) return;
            handleUpdateMessages("add", message.id, message);
        });

        chan.bind(
            "message-edited",
            ({ messageId, updates }: { messageId: number; updates: Partial<ResponseMessage> }) => {
                handleUpdateMessages("update", messageId, updates);
            }
        );

        chan.bind(
            "message-reaction-added",
            ({
                messageId,
                reactorId,
                reaction,
            }: {
                messageId: number;
                reactorId: number;
                reaction: {
                    id?: number;
                    name: string;
                    count: number;
                };
            }) => {
                mutate(
                    (prev: any) => {
                        return prev.map((a) =>
                            a.map((m) => {
                                if (m.id === messageId) {
                                    const existing = m.reactions.find((r) =>
                                        !reaction.id
                                            ? r.name === reaction.name
                                            : r.id === reaction.id
                                    );

                                    return {
                                        ...m,
                                        reactions: !existing
                                            ? [
                                                  ...m.reactions,
                                                  {
                                                      ...reaction,
                                                      me: reactorId === userId,
                                                  },
                                              ]
                                            : m.reactions.map((r) => {
                                                  const isSame = !reaction.id
                                                      ? r.name === reaction.name
                                                      : r.id === reaction.id;

                                                  return isSame
                                                      ? {
                                                            ...r,
                                                            count: r.count + 1,
                                                            me: existing.me || reactorId === userId,
                                                        }
                                                      : r;
                                              }),
                                    };
                                }

                                return m;
                            })
                        );
                    },
                    { revalidate: false }
                );
            }
        );

        chan.bind(
            "message-reaction-removed",
            ({
                messageId,
                reactorId,
                reaction,
            }: {
                messageId: number;
                reactorId: number;
                reaction: string;
            }) => {
                mutate(
                    (prev: any) => {
                        return prev.map((a) =>
                            a.map((m) => {
                                if (m.id === messageId) {
                                    const existing = m.reactions.find((r) => {
                                        if (typeof reaction === "string") {
                                            return r.name === reaction;
                                        }

                                        return r.id === reaction;
                                    });

                                    return {
                                        ...m,
                                        reactions:
                                            existing?.count === 1
                                                ? m.reactions.filter((r) => r !== existing)
                                                : m.reactions.map((r) => {
                                                      const isSame =
                                                          typeof reaction === "string"
                                                              ? r.name === reaction
                                                              : r.id === reaction;

                                                      return isSame
                                                          ? {
                                                                ...r,
                                                                count: r.count - 1,
                                                                me: r.me && reactorId !== userId,
                                                            }
                                                          : r;
                                                  }),
                                    };
                                }

                                return m;
                            })
                        );
                    },
                    { revalidate: false }
                );
            }
        );

        chan.bind("message-deleted", ({ messageId }: { messageId: number }) => {
            handleUpdateMessages("delete", messageId);
        });

        return () => {
            socket.unsubscribe(`private-channel-${channel.id}-receive`);
        };
    }, [socket]);

    useEffect(() => {
        document.title = `Spark | @${channel.name}`;
        setChannelUrl(channel.id.toString());
    }, [channel]);

    useEffect(() => {
        const load = shouldLoad && hasMore && !isLoading && messages.length > 0;
        if (load) setSize(size + 1);
    }, [shouldLoad]);

    const scrollToBottom = () => {
        const container = scrollEl.current;
        if (!container) return;

        removeNotification(channel.id);
        container.scrollTop = container.scrollHeight;
    };

    const checkIfAtBottom = () => {
        const container = scrollEl.current;
        if (!container) return;

        const isBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 1;
        setIsAtBottom(isBottom);
    };

    // Attach scroll listener
    useLayoutEffect(() => {
        const container = scrollEl.current;
        if (!container) return;

        const onScroll = () => checkIfAtBottom();
        container.addEventListener("scroll", onScroll);

        return () => container.removeEventListener("scroll", onScroll);
    }, []);

    // Observe size changes
    useEffect(() => {
        const container = scrollEl.current;
        if (!container) return;

        const resizeObserver = new ResizeObserver(() => {
            if (isAtBottom) {
                scrollToBottom();
            }
        });

        const mutationObserver = new MutationObserver(() => {
            if (isAtBottom) {
                scrollToBottom();
            }
        });

        resizeObserver.observe(container);
        mutationObserver.observe(container, { childList: true, subtree: true });

        return () => {
            resizeObserver.disconnect();
            mutationObserver.disconnect();
        };
    }, [isAtBottom]);

    function handleUpdateMessages(
        type: "add" | "update" | "delete",
        id: number,
        message?: Partial<ResponseMessage>,
        fullyReplace?: boolean
    ) {
        if (type === "add") {
            mutate(
                (prev: any) => {
                    if (!prev || prev.length === 0) return [[message]];
                    return [[message, ...prev[0]], ...prev.slice(1)];
                },
                { revalidate: false }
            );
        } else if (type === "update") {
            mutate(
                (prev: any) =>
                    prev.map((a) =>
                        a.map((m) =>
                            m.id === id
                                ? fullyReplace
                                    ? message
                                    : {
                                          ...m,
                                          ...message,
                                      }
                                : m
                        )
                    ),
                {
                    revalidate: false,
                }
            );
        } else if (type === "delete") {
            mutate((prev: any) => prev.map((a) => a.filter((m) => m.id !== id)), {
                revalidate: false,
            });
        }
    }

    return useMemo(
        () => (
            <main className={styles.container}>
                <div>
                    <div
                        ref={scrollEl}
                        className={styles.scroller + " scrollbar"}
                    >
                        <div>
                            <ol>
                                {hasMore || (isLoading && !messages.length) ? (
                                    <div ref={hasMore ? skeletonEl : undefined}>
                                        <MessageSk />
                                    </div>
                                ) : (
                                    <FirstMessage
                                        friend={friend}
                                        channel={channel}
                                    />
                                )}

                                {messages.map((message, index) => (
                                    <div key={message.id}>
                                        {isNewDay(messages, index) && (
                                            <div className={styles.divider}>
                                                <span>{getDayDate(message.createdAt)}</span>
                                            </div>
                                        )}

                                        <Message
                                            message={message}
                                            channel={channel}
                                            large={isLarge(messages, index)}
                                            setMessages={handleUpdateMessages}
                                        />
                                    </div>
                                ))}

                                <div
                                    className={styles.spacer}
                                    ref={spacerEl}
                                />
                            </ol>
                        </div>
                    </div>
                </div>

                <TextArea
                    channel={channel}
                    setMessages={(message: ResponseMessage) => {
                        handleUpdateMessages("add", message.id, message);
                    }}
                />
            </main>
        ),
        [hasMore, isLoading, messages, channel, friend]
    );
}

function FirstMessage({ channel, friend }: { channel: DMChannel; friend?: KnownUser }) {
    const [loading, setLoading] = useState<{
        [key: string]: boolean;
    }>({});

    const { friends, blocked, received, sent } = useData();
    const { sendRequest } = useFetchHelper();

    const mutualGuilds: Guild[] = [];
    const guildIcons = mutualGuilds.filter((guild) => !!guild.icon);

    const isFriend = friends.find((f) => f.id === friend?.id);
    const isSent = sent.find((f) => f.id === friend?.id);
    const isReceived = received.find((f) => f.id === friend?.id);
    const isBlocked = blocked.find((f) => f.id === friend?.id);

    async function addFriend() {
        if (!friend) return;
        setLoading((prev) => ({ ...prev, addFriend: true }));

        try {
            const { errors } = await sendRequest({
                query: "ADD_FRIEND",
                body: { username: friend?.username },
            });
        } catch (error) {
            console.error(error);
        }

        setLoading((prev) => ({ ...prev, addFriend: false }));
    }

    async function removeFriend() {
        if (!friend) return;
        setLoading((prev) => ({ ...prev, removeFriend: true }));

        try {
            const { errors } = await sendRequest({
                query: "REMOVE_FRIEND",
                body: { username: friend.username },
            });
        } catch (error) {
            console.error(error);
        }

        setLoading((prev) => ({ ...prev, removeFriend: false }));
    }

    async function blockUser() {
        if (!friend) return;
        setLoading((prev) => ({ ...prev, blockUser: true }));

        try {
            const { errors } = await sendRequest({
                query: "BLOCK_USER",
                params: { userId: friend.id },
            });
        } catch (error) {
            console.error(error);
        }

        setLoading((prev) => ({ ...prev, blockUser: false }));
    }

    async function unblockUser() {
        setLoading((prev) => ({ ...prev, unblockUser: true }));

        try {
            const { errors } = await sendRequest({
                query: "UNBLOCK_USER",
                params: { userId: friend?.id },
            });
        } catch (error) {
            console.error(error);
        }

        setLoading((prev) => ({ ...prev, unblockUser: false }));
    }

    return (
        <div className={styles.header}>
            <div className={styles.imageWrapper}>
                <Avatar
                    size={80}
                    alt={channel.name}
                    type={friend ? "user" : "channel"}
                    generateId={friend?.id || channel.id}
                    fileId={friend?.avatar || channel.icon}
                />
            </div>

            <h3>{channel.name}</h3>

            <div className={styles.description}>
                {friend ? (
                    <>
                        This is the beginning of your direct message history with
                        <strong> @{channel.name}</strong>.
                    </>
                ) : (
                    <>
                        Welcome to the beginning of the
                        <strong> {channel.name}</strong> group.
                    </>
                )}

                {friend && (
                    <div className={styles.actions}>
                        {mutualGuilds.length > 0 && (
                            <div className={styles.mutualGuildIcons}>
                                {guildIcons
                                    .map((guild) => (
                                        <Image
                                            width={24}
                                            height={24}
                                            key={guild.id}
                                            alt={guild.name}
                                            src={`${getCdnUrl}${guild.icon}`}
                                        />
                                    ))
                                    .slice(0, 3)}
                            </div>
                        )}

                        {mutualGuilds.length > 0 && (
                            <div
                                className={styles.mutualGuildText}
                                onClick={() => {
                                    // setLayers({
                                    //     settings: { type: "USER_PROFILE" },
                                    //     content: { user: friend, guilds: true },
                                    // });
                                }}
                            >
                                {mutualGuilds.length} Mutual Server{mutualGuilds.length > 1 && "s"}
                            </div>
                        )}

                        {mutualGuilds.length > 0 && <div className={styles.mutualGuildDot} />}

                        {isFriend ? (
                            <button
                                className="button grey"
                                onClick={() => removeFriend()}
                            >
                                {loading.removeFriend ? <LoadingDots /> : "Remove Friend"}
                            </button>
                        ) : isSent ? (
                            <button
                                tabIndex={-1}
                                className="button blue disabled"
                            >
                                {loading.addFriend ? <LoadingDots /> : "Friend Request Sent"}
                            </button>
                        ) : isReceived ? (
                            <button
                                className="button grey"
                                onClick={() => addFriend()}
                            >
                                {loading.addFriend ? <LoadingDots /> : "Accept Friend Request"}
                            </button>
                        ) : (
                            !isBlocked && (
                                <button
                                    className="button blue"
                                    onClick={() => addFriend()}
                                >
                                    {loading.addFriend ? <LoadingDots /> : "Add Friend"}
                                </button>
                            )
                        )}

                        {!isBlocked ? (
                            <button
                                className="button grey"
                                onClick={() => blockUser()}
                            >
                                {loading.blockUser ? <LoadingDots /> : "Block"}
                            </button>
                        ) : (
                            <button
                                className="button grey"
                                onClick={() => unblockUser()}
                            >
                                {loading.unblockUser ? <LoadingDots /> : "Unblock"}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
