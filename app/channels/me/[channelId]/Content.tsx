"use client";

import type { ChannelRecipient, DMChannel, Guild, ResponseMessage } from "@/type";
import { Message, TextArea, MessageSk, Avatar, LoadingDots } from "@components";
import { useRef, useEffect, useMemo, useState, useLayoutEffect } from "react";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { useAuthenticatedUser } from "@/hooks/useAuthenticatedUser";
import { useData, useTriggerDialog, useUrls } from "@/store";
import { isInline, isLarge, isNewDay } from "@/lib/message";
import { useRelationships } from "@/hooks/useRelationships";
import { useNotifications } from "@/store/notifications";
import { useFetchMessages } from "@/hooks/useFetchData";
import { useRequests } from "@/hooks/useRequests";
import { getCdnUrl } from "@/lib/uploadthing";
import styles from "./Channels.module.css";
import { useSocket } from "@/store/socket";
import { getDayDate } from "@/lib/time";
import Image from "next/image";

export type HandleMessageUpdate = {
    (
        type: "add" | "update" | "delete",
        id: number,
        message?: Partial<ResponseMessage> | ResponseMessage,
        fullyReplace?: boolean
    ): void;
};

const LIMIT = 50;

export default function Content({ channelId }: { channelId: number }) {
    const { data, isLoading, mutate, size, setSize } = useFetchMessages(channelId, LIMIT);
    const [isAtBottom, setIsAtBottom] = useState(true);

    const channel = useData((state) => state.channels).find((c) => c.id === channelId);
    const user = useAuthenticatedUser();

    if (!channel) return null;

    const friend =
        channel.type === 0 ? channel.recipients.find((r) => r.id !== user!.id) : undefined;

    const messages = useMemo(() => (data ? data.flat().reverse() : []), [data]);
    const hasMore = useMemo(() => (data ? data[data.length - 1].length === LIMIT : false), [data]);

    const scrollEl = useRef<HTMLDivElement>(null);
    const spacerEl = useRef<HTMLDivElement>(null);

    const [skeletonEl, entry] = useIntersectionObserver({
        root: null,
        threshold: 0.1,
        rootMargin: "0px",
    });

    // @ts-ignore - Works
    const shouldLoad = entry?.isIntersecting;

    const setChannelUrl = useUrls((state) => state.setMe);
    const { removeNotification } = useNotifications();
    const { socket } = useSocket();

    useEffect(() => {
        document.title = `Spark | @${channel.name}`;
        setChannelUrl(channel.id.toString());
    }, [channel]);

    useEffect(() => {
        if (!socket) return;

        const chan = socket.subscribe(`private-channel-${channel.id}-receive`);
        const userId = Number(socket.user.user_data?.id);

        chan.bind(
            "message-received",
            ({
                message,
                senderShouldReceive,
            }: {
                message: ResponseMessage;
                senderShouldReceive?: boolean;
            }) => {
                if (
                    message.author.id === userId &&
                    !isInline(message.type) &&
                    !senderShouldReceive
                ) {
                    return;
                }

                handleUpdateMessages("add", message.id, message);
            }
        );

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
                    id: number | null;
                    name: string;
                    count: number;
                };
            }) => {
                mutate(
                    (prev) => {
                        return prev?.map((a) =>
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
                    (prev) => {
                        return prev?.map((a) =>
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
        const load = shouldLoad && hasMore && !isLoading && messages.length > 0;
        if (load) setSize(size + 1);
    }, [shouldLoad]);

    const scrollToBottom = () => {
        const container = scrollEl.current;
        if (!container) return;

        // removeNotification(channel.id);
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
        message?: Partial<ResponseMessage> | ResponseMessage,
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
        } else if (type === "update" && message) {
            mutate(
                (prev) =>
                    prev?.map((a) =>
                        a.map((m) =>
                            m.id === id
                                ? fullyReplace
                                    ? (message as ResponseMessage)
                                    : { ...m, ...message }
                                : m
                        )
                    ),
                { revalidate: false }
            );
        } else if (type === "delete") {
            mutate((prev) => prev?.map((a) => a.filter((m) => m.id !== id)), {
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
                                    // @ts-ignore - Works
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
                                                <span>
                                                    {getDayDate(new Date(message.createdAt))}
                                                </span>
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
                                    ref={spacerEl}
                                    className={styles.spacer}
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

function FirstMessage({ channel, friend }: { channel: DMChannel; friend?: ChannelRecipient }) {
    const { isFriend, hasRequested, wasRequested, isBlocked } = useRelationships(friend?.id);
    const { addFriend, removeFriend, blockUser, unblockUser } = useRequests();
    const { triggerDialog } = useTriggerDialog();

    const mutualGuilds: Guild[] = [];
    const guildIcons = mutualGuilds.filter((guild) => !!guild.icon);

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
                                    triggerDialog({
                                        type: "USER_PROFILE",
                                        data: { user: friend, startingTab: 2 },
                                    });
                                }}
                            >
                                {mutualGuilds.length} Mutual Server{mutualGuilds.length > 1 && "s"}
                            </div>
                        )}

                        {mutualGuilds.length > 0 && <div className={styles.mutualGuildDot} />}

                        {isFriend ? (
                            <button
                                className="button regular grey"
                                onClick={() => removeFriend.send({ username: friend.username })}
                            >
                                {removeFriend.isLoading ? <LoadingDots /> : "Remove Friend"}
                            </button>
                        ) : wasRequested ? (
                            <button
                                tabIndex={-1}
                                className="button regular blue disabled"
                            >
                                {addFriend.isLoading ? <LoadingDots /> : "Friend Request Sent"}
                            </button>
                        ) : hasRequested ? (
                            <button
                                className="button regular grey"
                                onClick={() => addFriend.send({ username: friend.username })}
                            >
                                {addFriend.isLoading ? <LoadingDots /> : "Accept Friend Request"}
                            </button>
                        ) : (
                            !isBlocked && (
                                <button
                                    className="button regular blue"
                                    onClick={() => addFriend.send({ username: friend.username })}
                                >
                                    {addFriend.isLoading ? <LoadingDots /> : "Add Friend"}
                                </button>
                            )
                        )}

                        {!isBlocked ? (
                            <button
                                className="button regular grey"
                                onClick={() => blockUser.send({ userId: friend.id })}
                            >
                                {blockUser.isLoading ? <LoadingDots /> : "Block"}
                            </button>
                        ) : (
                            <button
                                className="button regular grey"
                                onClick={() => unblockUser.send({ userId: friend.id })}
                            >
                                {unblockUser.isLoading ? <LoadingDots /> : "Unblock"}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
