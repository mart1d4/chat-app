"use client";

import type { Channel, Guild, Message as TMessage, User } from "@/type";
import { Message, TextArea, MessageSk, Avatar } from "@components";
import { useIntersection } from "@/hooks/useIntersection";
import type { SWRInfiniteKeyLoader } from "swr/infinite";
import { useData, useLayers, useUrls } from "@/store";
import useFetchHelper from "@/hooks/useFetchHelper";
import { useRef, useEffect, useMemo } from "react";
import { isLarge, isNewDay } from "@/lib/message";
import styles from "./Channels.module.css";
import useSWRInfinite from "swr/infinite";
import fetchHelper from "@/hooks/useSwr";
import { getDayDate } from "@/lib/time";
import Image from "next/image";

const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL;
let initMessagesFetch = false;
let sendingMessage = false;
let lastScrollHeight = 0;
const limit = 50;

export default function Content({ channel, friend }: { channel: Channel; friend: User }) {
    const getKey: SWRInfiniteKeyLoader = (_, previousData) => {
        const baseUrl = `/channels/${channel.id}/messages?limit=`;

        if (previousData) {
            if (previousData.length < limit) {
                return null;
            }

            const last = previousData[previousData.length - 1];
            return `${baseUrl}${limit}&before=${last.createdAt}`;
        }

        return `${baseUrl}${limit}`;
    };

    const { data, isLoading, mutate, size, setSize } = useSWRInfinite<TMessage[], Error>(
        getKey,
        fetchHelper().request,
        {
            errorRetryCount: 3,
            revalidateIfStale: false,
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
        }
    );

    const messages = data ? data.flat().reverse() : [];
    const hasMore = messages.length % limit === 0;

    const skeletonEl = useRef<HTMLDivElement>(null);
    const scrollEl = useRef<HTMLDivElement>(null);
    const spacerEl = useRef<HTMLDivElement>(null);

    const setChannelUrl = useUrls((state) => state.setMe);
    const shouldLoad = useIntersection(skeletonEl, -100);

    document.title = `Spark | @${channel.name}`;
    setChannelUrl(channel.id.toString());

    function handleScroll() {
        if (scrollEl.current) {
            if (lastScrollHeight === 0 || sendingMessage) {
                sendingMessage = false;

                const t = setTimeout(() => {
                    spacerEl.current?.scrollIntoView();
                }, 50);

                return () => clearTimeout(t);
            }

            const scrollDif = scrollEl.current.scrollHeight - lastScrollHeight;
            scrollEl.current.scrollTop += scrollDif;
        }
    }

    useEffect(() => {
        handleScroll();
    });

    useEffect(() => {
        const load = shouldLoad && hasMore && !isLoading && messages.length > 0;
        if (load) setSize(size + 1);
    }, [shouldLoad]);

    return useMemo(
        () => (
            <main className={styles.container}>
                <div>
                    <div
                        ref={scrollEl}
                        onScroll={() => {
                            if (!initMessagesFetch && lastScrollHeight === 0) {
                                initMessagesFetch = true;
                                return;
                            }

                            lastScrollHeight = scrollEl.current?.scrollHeight || 0;
                        }}
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
                                            setMessages={(
                                                type: "add" | "update" | "delete",
                                                id: number,
                                                message?: TMessage
                                            ): void => {
                                                sendingMessage = true;

                                                if (type === "add") {
                                                    mutate((prev) => [message, ...prev], {
                                                        revalidate: false,
                                                    });
                                                } else if (type === "update") {
                                                    mutate(
                                                        (prev) =>
                                                            prev?.map((m) =>
                                                                m.id === id ? message : m
                                                            ),
                                                        { revalidate: false }
                                                    );
                                                } else if (type === "delete") {
                                                    mutate(
                                                        (prev) =>
                                                            prev?.map((a) =>
                                                                a.filter((m) => m.id !== id)
                                                            ),
                                                        { revalidate: false }
                                                    );
                                                }

                                                sendingMessage = false;
                                            }}
                                            large={isLarge(messages, index)}
                                            channel={channel}
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
                    setMessages={(message: TMessage) => {
                        sendingMessage = true;
                        mutate((prev) => [message, ...prev], {
                            revalidate: false,
                        });
                        sendingMessage = false;
                    }}
                />
            </main>
        ),
        [data, isLoading, hasMore]
    );
}

function FirstMessage({ channel, friend }: { channel: Channel; friend: User }) {
    const requestsR = useData((state) => state.received).map((u) => u.id);
    const requestsS = useData((state) => state.sent).map((u) => u.id);
    const friends = useData((state) => state.friends).map((u) => u.id);
    const blocked = useData((state) => state.blocked).map((u) => u.id);
    const setLayers = useLayers((state) => state.setLayers);
    const { sendRequest } = useFetchHelper();

    const mutualGuilds: Guild[] = [];
    const guildIcons = mutualGuilds.filter((guild) => !!guild.icon);

    return (
        <div className={styles.header}>
            <div className={styles.imageWrapper}>
                <Avatar
                    src={channel.icon as string}
                    alt={channel.name as string}
                    type="icons"
                    size={80}
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
                                            key={guild.id}
                                            src={`${cdnUrl}/${guild.icon}`}
                                            alt={guild.name}
                                            width={24}
                                            height={24}
                                        />
                                    ))
                                    .slice(0, 3)}
                            </div>
                        )}

                        {mutualGuilds.length > 0 && (
                            <div
                                className={styles.mutualGuildText}
                                onClick={() => {
                                    setLayers({
                                        settings: { type: "USER_PROFILE" },
                                        content: { user: friend, guilds: true },
                                    });
                                }}
                            >
                                {mutualGuilds.length} Mutual Server{mutualGuilds.length > 1 && "s"}
                            </div>
                        )}

                        {mutualGuilds.length > 0 && <div className={styles.mutualGuildDot} />}

                        {friends.includes(friend.id) ? (
                            <button
                                className="button grey"
                                onClick={() => {
                                    sendRequest({
                                        query: "REMOVE_FRIEND",
                                        body: { username: friend.username },
                                    });
                                }}
                            >
                                Remove Friend
                            </button>
                        ) : requestsS.includes(friend.id) ? (
                            <button className="button blue disabled">Friend Request Sent</button>
                        ) : requestsR.includes(friend.id) ? (
                            <button
                                className="button grey"
                                onClick={() => {
                                    sendRequest({
                                        query: "ADD_FRIEND",
                                        body: { username: friend.username },
                                    });
                                }}
                            >
                                Accept Friend Request
                            </button>
                        ) : (
                            !blocked.includes(friend.id) && (
                                <button
                                    className="button blue"
                                    onClick={() => {
                                        sendRequest({
                                            query: "ADD_FRIEND",
                                            body: { username: friend.username },
                                        });
                                    }}
                                >
                                    Add Friend
                                </button>
                            )
                        )}

                        {!blocked.includes(friend.id) ? (
                            <button
                                className="button grey"
                                onClick={() => {
                                    sendRequest({
                                        query: "BLOCK_USER",
                                        params: { userId: friend.id },
                                    });
                                }}
                            >
                                Block
                            </button>
                        ) : (
                            <button
                                className="button grey"
                                onClick={() => {
                                    sendRequest({
                                        query: "UNBLOCK_USER",
                                        params: { userId: friend.id },
                                    });
                                }}
                            >
                                Unblock
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
