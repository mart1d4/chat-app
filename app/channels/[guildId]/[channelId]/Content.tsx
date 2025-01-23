"use client";

import { useRef, useEffect, useMemo, type RefObject, useState, useLayoutEffect } from "react";
import type { GuildChannel, GuildMember, ResponseMessage, UserGuild } from "@/type";
import { useData, useShowSettings, useUrls } from "@/store";
import { useIntersection } from "@/hooks/useIntersection";
import type { SWRInfiniteKeyLoader } from "swr/infinite";
import { isLarge, isNewDay } from "@/lib/message";
import styles from "./Channels.module.css";
import useSWRInfinite from "swr/infinite";
import fetchHelper from "@/hooks/useSwr";
import { getDayDate } from "@/lib/time";
import Link from "next/link";
import {
    InteractiveElement,
    DialogContent,
    DialogTrigger,
    InviteDialog,
    MessageSk,
    TextArea,
    Message,
    Dialog,
    Icon,
} from "@components";

const LIMIT = 50;

export default function Content({
    guildId,
    channel,
    members,
}: {
    guildId: number;
    channel: GuildChannel;
    members: GuildMember[];
}) {
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
            errorRetryCount: 3,
            revalidateIfStale: false,
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
        }
    );

    const [isAtBottom, setIsAtBottom] = useState(true);

    const messages = useMemo(() => (data ? data.flat().reverse() : []), [data]);
    const hasMore = useMemo(() => (data ? data[data.length - 1].length === LIMIT : false), [data]);

    const skeletonEl = useRef<HTMLDivElement>(null);
    const scrollEl = useRef<HTMLDivElement>(null);
    const spacerEl = useRef<HTMLDivElement>(null);

    const guild = useData((state) => state.guilds).find((g) => g.id === guildId) as UserGuild;

    const setGuildUrl = useUrls((state) => state.setGuild);
    const shouldLoad = useIntersection(skeletonEl as RefObject<HTMLDivElement>, -200);

    useEffect(() => {
        document.title = `${channel.name} | ${guild.name} | Spark`;
        setGuildUrl(guild.id, channel.id);
    }, [channel, guild]);

    useEffect(() => {
        const load = shouldLoad && hasMore && !isLoading && messages.length > 0;
        if (load) setSize(size + 1);
    }, [shouldLoad]);

    const scrollToBottom = () => {
        const container = scrollEl.current;
        if (!container) return;

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
        message?: Partial<ResponseMessage>
    ) {
        if (type === "add") {
            mutate(
                (prev: any) => {
                    if (!prev || prev.length === 0) {
                        return [[message]];
                    }

                    // Add the message to the beginning of the first inner array
                    return [[message, ...prev[0]], ...prev.slice(1)];
                },
                { revalidate: false }
            );
        } else if (type === "update") {
            mutate(
                (prev: any) => {
                    // Find the message and update it
                    if (!prev || prev.length === 0) {
                        return [[message]];
                    }

                    return prev.map((a) => a.map((m) => (m.id === id ? message : m)));
                },
                { revalidate: false }
            );
        } else if (type === "delete") {
            mutate(
                (prev: any) => {
                    // Find the message and remove it
                    return prev.map((a) => a.filter((m) => m.id !== id));
                },
                { revalidate: false }
            );
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
                                        guild={guild}
                                        members={members}
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
        [hasMore, isLoading, messages, channel, guild]
    );
}

export function FirstMessage({
    guild,
    channel,
    members,
}: {
    guild: UserGuild;
    channel: GuildChannel & { isPrivate: boolean };
    members: GuildMember[];
}) {
    const setShowSettings = useShowSettings((s) => s.setShowSettings);

    const content = [
        {
            text: "Invite your friends",
            icon: "/assets/system/invite.svg",
            completed: members.length > 1,
        },
        {
            text: "Personalize your server with an icon",
            icon: "/assets/system/personalize.svg",
            completed: !!guild.icon,
            onClick: () => {
                setShowSettings({ type: "GUILD", guild });
            },
        },
        {
            text: "Send your first message",
            icon: "/assets/system/send.svg",
            onClick: () => {
                const el = document.getElementById(`textarea-${channel.id}`);
                if (el) el.focus();
            },
        },
        {
            text: "Add your first app",
            icon: "/assets/system/app.svg",
            onClick: () => {},
        },
    ];

    if (guild.systemChannelId === channel.id) {
        return (
            <div className={styles.systemChannel}>
                <div>
                    <div>
                        <div className={styles.welcomeMessage}>
                            <h3>
                                <p>Welcome to</p>
                                <p>{guild.name}</p>
                            </h3>

                            <div>
                                This is your brand new, shiny server. Here are some steps to help
                                you get started. For more, check out our{" "}
                                <Link href="/forum/getting-started">Getting Started guide</Link>.
                            </div>
                        </div>

                        {content.map((c) => {
                            const item = (
                                <InteractiveElement
                                    key={c.text}
                                    className={styles.welcomeCard}
                                    {...(c.onClick ? { onClick: c.onClick } : {})}
                                >
                                    <div
                                        style={{
                                            backgroundImage: `url(${c.icon})`,
                                            opacity: c.completed ? 0.6 : 1,
                                        }}
                                    />

                                    <div style={{ opacity: c.completed ? 0.6 : 1 }}>{c.text}</div>

                                    {c.completed ? (
                                        <svg
                                            className={styles.completedMark}
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            width="24"
                                            height="24"
                                            fill="none"
                                        >
                                            <path
                                                fill="currentColor"
                                                d="M21.7 5.3a1 1 0 0 1 0 1.4l-12 12a1 1 0 0 1-1.4 0l-6-6a1 1 0 1 1 1.4-1.4L9 16.58l11.3-11.3a1 1 0 0 1 1.4 0Z"
                                            />
                                        </svg>
                                    ) : (
                                        <Icon name="caret" />
                                    )}
                                </InteractiveElement>
                            );

                            if (c.text === "Invite your friends") {
                                return (
                                    <Dialog key={c.text}>
                                        <DialogTrigger>{item}</DialogTrigger>

                                        <DialogContent blank>
                                            <InviteDialog
                                                guild={guild}
                                                channel={channel}
                                            />
                                        </DialogContent>
                                    </Dialog>
                                );
                            }

                            return item;
                        })}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.firstTimeMessageContainer}>
            <div className={styles.channelIcon}>
                <Icon
                    size={44}
                    name={channel.isPrivate ? "hashtagLock" : "hashtag"}
                />
            </div>

            <h3 className={styles.friendUsername}>Welcome to #{channel.name}!</h3>

            <div className={styles.descriptionContainer}>
                This is the start of the #{channel.name}{" "}
                {channel.isPrivate && <strong>private</strong>} channel.
            </div>
        </div>
    );
}
