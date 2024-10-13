"use client";

import type { Channel, Guild, Message as TMessage } from "@/type";
import { Message, TextArea, MessageSk, Icon } from "@components";
import { useIntersection } from "@/hooks/useIntersection";
import type { SWRInfiniteKeyLoader } from "swr/infinite";
import { useShowSettings, useUrls } from "@/store";
import { useRef, useEffect, useMemo } from "react";
import { isLarge, isNewDay } from "@/lib/message";
import styles from "./Channels.module.css";
import useSWRInfinite from "swr/infinite";
import fetchHelper from "@/hooks/useSwr";
import { getDayDate } from "@/lib/time";
import Link from "next/link";

let initMessagesFetch = false;
let sendingMessage = false;
let lastScrollHeight = 0;
const limit = 50;

export default function Content({ guild, channel }: { guild: Guild; channel: Channel }) {
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

    const messages = data?.flat().reverse() || [];
    const hasMore = true;

    const skeletonEl = useRef<HTMLDivElement>(null);
    const scrollEl = useRef<HTMLDivElement>(null);
    const spacerEl = useRef<HTMLDivElement>(null);

    const setChannelUrl = useUrls((state) => state.setMe);
    const shouldLoad = useIntersection(skeletonEl, -150);

    document.title = `${channel.name} | ${guild.name} | Spark`;
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
        console.log("Should load", shouldLoad);
        console.log("Has more", hasMore);
        console.log("Is loading", isLoading);
        console.log("Messages length", messages.length);

        const load = shouldLoad && hasMore && !isLoading && messages.length > 0;
        if (load) setSize(size + 1);
    }, [shouldLoad, hasMore, isLoading, messages.length]);

    console.log("Has more", hasMore);

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
                                {hasMore || isLoading ? (
                                    <div ref={hasMore ? skeletonEl : undefined}>
                                        <MessageSk />
                                    </div>
                                ) : (
                                    <FirstMessage
                                        guild={guild}
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
                                                message: TMessage,
                                                type: "add" | "update"
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

export function FirstMessage({ guild, channel }: { guild: Guild; channel: Channel }) {
    const setShowSettings = useShowSettings((s) => s.setShowSettings);

    const content = [
        {
            text: "Invite your friends",
            icon: "/assets/system/invite.svg",
            completed: guild.members.length > 1,
            onClick: () => {
                // setLayers({
                //     settings: { type: "POPUP" },
                //     content: {
                //         type: "GUILD_INVITE",
                //         guild: guild,
                //         channel: channel,
                //     },
                // });
            },
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
            onclick: () => {},
        },
        {
            text: "Add your first app",
            icon: "/assets/system/app.svg",
            onclick: () => {},
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

                        {content.map((c) => (
                            <div
                                key={c.text}
                                className={styles.welcomeCard}
                                onClick={c.onClick}
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
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.firstTimeMessageContainer}>
            <div
                className={styles.channelIcon}
                style={{ backgroundImage: `url(/assets/system/hashtag.svg)` }}
            />

            <h3 className={styles.friendUsername}>Welcome to #{channel.name}!</h3>

            <div className={styles.descriptionContainer}>
                This is the start of the #{channel.name} channel.
            </div>
        </div>
    );
}
