"use client";

import { AppHeader, Message, TextArea, MemberList, MessageSk, Icon } from "@components";
import { useState, useEffect, useCallback, ReactElement, useMemo } from "react";
import { shouldDisplayInlined } from "@/lib/message";
import pusher from "@/lib/pusher/client-connection";
import { useData, useLayers, useUrls } from "@/lib/store";
import styles from "./Channels.module.css";

type TMessageData = {
    channelId: TChannel["id"];
    message: TMessage;
};

type TMessageIdData = {
    channelId: TChannel["id"];
    messageId: TMessage["id"];
};

interface Props {
    guild: TGuild;
    channel: TChannel;
}

const Content = ({ guild, channel }: Props): ReactElement => {
    const [scrollerNode, setScrollerNode] = useState<HTMLDivElement | null>(null);
    const [isAtBottom, setIsAtBottom] = useState<boolean>(true);
    const [messages, setMessages] = useState<TMessage[]>([]);
    const [hasMore, setHasMore] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);

    const setGuildUrl = useUrls((state) => state.setGuild);
    const token = useData((state) => state.token);
    const user = useData((state) => state.user);

    useEffect(() => {
        if (!user) return;

        pusher.bind("message-sent", (data: TMessageData) => {
            if (data.channelId === channel.id && data.message.author.id !== user.id) {
                setMessages((prev) => [...prev, data.message]);
            }
        });

        pusher.bind("message-edited", (data: TMessageData) => {
            if (data.channelId === channel.id) {
                setMessages((prev) =>
                    prev.map((message) => {
                        if (message.id === data.message.id) return data.message;
                        return message;
                    })
                );
            }
        });

        pusher.bind("message-deleted", (data: TMessageIdData) => {
            if (data.channelId === channel.id) {
                setMessages((prev) => prev.filter((message) => message.id !== data.messageId));
            }
        });

        return () => {
            pusher.unbind("message-sent");
            pusher.unbind("message-edited");
            pusher.unbind("message-deleted");
        };
    }, [user]);

    useEffect(() => {
        document.title = `Chat App | #${channel.name} | ${guild.name}`;
        setGuildUrl(guild.id, channel.id);

        const getMessages = async () => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/channels/${channel.id}/messages`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }).then((res) => res.json());

            if (!response.error) {
                setMessages(response.messages);
                setHasMore(response.hasMore);
            }

            setLoading(false);
        };

        getMessages();
    }, []);

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

    useEffect(() => {
        console.log(isAtBottom);
    }, [isAtBottom]);

    return useMemo(
        () => (
            <div className={styles.container}>
                <AppHeader channel={channel} />

                <div className={styles.content}>
                    <main className={styles.main}>
                        <div className={styles.messagesWrapper}>
                            <div
                                ref={scrollContainer}
                                className={styles.messagesScrollableContainer + " scrollbar"}
                                onScroll={(e) => {
                                    if (
                                        e.currentTarget.scrollTop + e.currentTarget.clientHeight >=
                                        e.currentTarget.scrollHeight
                                    ) {
                                        if (!isAtBottom) setIsAtBottom(true);
                                    } else if (isAtBottom) {
                                        setIsAtBottom(false);
                                    }
                                }}
                            >
                                <div
                                    ref={scrollContainerChild}
                                    className={styles.scrollContent}
                                >
                                    <ol className={styles.scrollContentInner}>
                                        {loading ? (
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

                                                {messages?.map((message: TMessage, index: number) => (
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
                                                            guild={guild}
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

                    <MemberList
                        channel={channel}
                        guild={guild}
                    />
                </div>
            </div>
        ),
        [channel, loading, messages, hasMore]
    );
};

const FirstMessage = ({ guild, channel }: Props) => {
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
                                This is your brand new, shiny server. Here are some steps to help you get started. For
                                more, check out our <a href="">Getting Started guide</a>.
                            </div>
                        </div>

                        <div className={styles.welcomeCard}>
                            <div></div>
                            <div>Invite your friends</div>
                            <Icon name="arrow" />
                        </div>

                        <div className={styles.welcomeCard}>
                            <div></div>
                            <div>Personalize your server with an icon</div>
                            <Icon name="arrow" />
                        </div>

                        <div className={styles.welcomeCard}>
                            <div></div>
                            <div>Send your first message</div>
                            <Icon name="arrow" />
                        </div>

                        <div className={styles.welcomeCard}>
                            <div></div>
                            <div>Add your first app</div>
                            <Icon name="arrow" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.firstTimeMessageContainer}>
            <div className={styles.channelIcon} />
            <h3 className={styles.friendUsername}>Welcome to #{channel.name}!</h3>
            <div className={styles.descriptionContainer}>This is the start of the #{channel.name} channel.</div>
        </div>
    );
};

export default Content;
