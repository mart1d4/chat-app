"use client";

import { Message, TextArea, MessageSk, Icon } from "@components";
import { useState, useEffect, useCallback } from "react";
import { shouldDisplayInlined } from "@/lib/message";
import { useData, useUrls } from "@/lib/store";
import styles from "./Channels.module.css";
import Link from "next/link";

export default function Content({
    channel,
    guild,
    messagesLoading,
    initMessages,
    initHasMore,
}: {
    channel: Partial<ChannelTable>;
    guild: Partial<GuildTable>;
    messagesLoading: boolean;
    initMessages: Partial<MessageTable>[];
    initHasMore: boolean;
}) {
    const [scrollerNode, setScrollerNode] = useState(null);
    const [isAtBottom, setIsAtBottom] = useState(true);
    const [messages, setMessages] = useState(initMessages);
    const [hasMore, setHasMore] = useState(initHasMore);
    const [loading, setLoading] = useState(false);

    const setGuildUrl = useUrls((s) => s.setGuild);
    const user = useData((s) => s.user);

    useEffect(() => {
        document.title = `Chat App | #${channel.name} | ${guild.name}`;
        setGuildUrl(guild.id, channel.id);
    }, []);

    // useEffect(() => {
    //     pusher.bind("message", (data) => {
    //         if (data.channelId == channel.id && data.message.author.id != user.id) {
    //             setMessages((prev) => [...prev, data.message]);
    //         }
    //     });

    //     pusher.bind("message-deleted", (data) => {
    //         if (data.channelId == channel.id) {
    //             setMessages((prev) => prev.filter((m) => m.id != data.messageId));
    //         }
    //     });

    //     return () => {
    //         pusher.unbind("message");
    //         pusher.unbind("message-delete");
    //     };
    // }, []);

    const scrollContainer = useCallback(
        (node: HTMLDivElement) => {
            if (node === null) return;
            setScrollerNode(node);
            const resizeObserver = new ResizeObserver(() => {
                if (isAtBottom) node.scrollTop = node.scrollHeight;
            });
            resizeObserver.observe(node);
        },
        [isAtBottom]
    );

    const scrollContainerChild = useCallback(
        (node: HTMLDivElement) => {
            if (node === null || !scrollerNode) return;
            const resizeObserver = new ResizeObserver(() => {
                if (isAtBottom) scrollerNode.scrollTop = scrollerNode.scrollHeight;
            });
            resizeObserver.observe(node);
        },
        [isAtBottom, scrollerNode]
    );

    const moreThan5Minutes = (firstDate: Date, secondDate: Date) => {
        const diff = Math.abs(new Date(firstDate).getTime() - new Date(secondDate).getTime());
        return diff / (1000 * 60) >= 5;
    };

    const shouldBeLarge = (index: number) => {
        if (index === 0 || messages[index].type === 1) return true;

        if (shouldDisplayInlined(messages[index].type)) {
            if (shouldDisplayInlined(messages[index - 1].type)) return false;
            return true;
        }

        if (![0, 1].includes(messages[index - 1].type)) return true;

        if (messages[index - 1].author.id !== messages[index].author.id) return true;
        if (moreThan5Minutes(messages[index - 1].createdAt, messages[index].createdAt)) return true;

        return false;
    };

    const isNewDay = (index: number) => {
        if (index === 0) return true;

        const firstDate = new Date(messages[index - 1].createdAt);
        const secondDate = new Date(messages[index].createdAt);

        return (
            firstDate.getDate() !== secondDate.getDate() ||
            firstDate.getMonth() !== secondDate.getMonth() ||
            firstDate.getFullYear() !== secondDate.getFullYear()
        );
    };

    return (
        <main className={styles.main}>
            <div className={styles.messagesWrapper}>
                <div
                    ref={scrollContainer}
                    className={styles.messagesScrollableContainer + " scrollbar"}
                >
                    <div
                        ref={scrollContainerChild}
                        className={styles.scrollContent}
                    >
                        <ol className={styles.scrollContentInner}>
                            {loading || messagesLoading ? (
                                <MessageSk />
                            ) : (
                                <>
                                    {hasMore ? (
                                        <MessageSk />
                                    ) : (
                                        <FirstMessage
                                            guild={guild}
                                            channel={channel}
                                        />
                                    )}

                                    {messages.map((message, index) => (
                                        <div key={message.id}>
                                            {isNewDay(index) && (
                                                <div className={styles.messageDivider}>
                                                    <span>
                                                        {new Intl.DateTimeFormat("en-US", {
                                                            weekday: "long",
                                                            year: "numeric",
                                                            month: "long",
                                                            day: "numeric",
                                                        }).format(new Date(message.createdAt))}
                                                    </span>
                                                </div>
                                            )}

                                            <Message
                                                message={message}
                                                setMessages={setMessages}
                                                large={shouldBeLarge(index)}
                                                channel={channel}
                                            />
                                        </div>
                                    ))}
                                </>
                            )}

                            <div className={styles.scrollerSpacer} />
                        </ol>
                    </div>
                </div>
            </div>

            <TextArea
                channel={channel}
                setMessages={setMessages}
            />
        </main>
    );
}

const FirstMessage = ({ guild, channel }: Props) => {
    const content = [
        {
            text: "Invite your friends",
            icon: "e6a37780-7436-41eb-b818-fdb19e16bb0d",
        },
        {
            text: "Personalize your server with an icon",
            icon: "07a4b38b-38ae-4000-b7ad-68571a2806c6",
        },
        {
            text: "Send your first message",
            icon: "c8ecbba1-838c-4fa2-99ba-4f8cb7e0a6e1",
        },
        {
            text: "Add your first app",
            icon: "d5bce184-683e-4746-ae9c-68904a4a876e",
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
                            >
                                <div
                                    style={{
                                        backgroundImage: `url("https://ucarecdn.com/${c.icon}/")`,
                                    }}
                                />
                                <div>{c.text}</div>
                                <Icon name="caret" />
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
                style={{
                    backgroundImage: `url("https://ucarecdn.com/e3633915-f76c-4b2e-be30-ac65a1bdd3be/")`,
                }}
            />
            <h3 className={styles.friendUsername}>Welcome to #{channel.name}!</h3>
            <div className={styles.descriptionContainer}>
                This is the start of the #{channel.name} channel.
            </div>
        </div>
    );
};
