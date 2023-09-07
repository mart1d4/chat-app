"use client";

import { AppHeader, Message, TextArea, MemberList, MessageSk, Avatar } from "@components";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { shouldDisplayInlined } from "@/lib/message";
import pusher from "@/lib/pusher/client-connection";
import useFetchHelper from "@/hooks/useFetchHelper";
import { useData, useUrls } from "@/lib/store";
import styles from "./Channels.module.css";

type TMessageData = {
    channelId: TChannel["id"];
    message: TMessage;
};

type TMessageIdData = {
    channelId: TChannel["id"];
    messageId: TMessage["id"];
};

type Props = {
    channel: TChannel;
    user: TCleanUser;
    friend?: TCleanUser;
};

const Content = ({ channel, user, friend }: Props) => {
    const [scrollerNode, setScrollerNode] = useState<HTMLDivElement | null>(null);
    const [isAtBottom, setIsAtBottom] = useState<boolean>(true);
    const [messages, setMessages] = useState<TMessage[]>([]);
    const [hasMore, setHasMore] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);

    const setChannelUrl = useUrls((state) => state.setMe);
    const setToken = useData((state) => state.setToken);
    const token = useData((state) => state.token);
    const hasRendered = useRef<boolean>(false);

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
        document.title = `Chat App | @${channel.name}`;
        setChannelUrl(channel.id);

        const getMessages = async () => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/channels/${channel.id}/messages`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }).then((res) => res.json());

            console.log("[ChannelContent] ", response);
            if (response.status === 401) {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/refresh`, {
                    method: "GET",
                    credentials: "include",
                }).then((res) => res.json());

                if (!response.token) throw new Error("[ChannelContent] No token found");
                setToken(response.token);
            } else if (!response.error) {
                setMessages(response.messages);
                setHasMore(response.hasMore);
            }

            setLoading(false);
        };

        const env = process.env.NODE_ENV;
        if (env == "development") {
            if (hasRendered.current) getMessages();
            return () => {
                hasRendered.current = true;
            };
        } else if (env == "production") {
            getMessages();
        }
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
                <AppHeader
                    channel={channel}
                    friend={friend}
                />

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
                                                        channel={channel}
                                                        user={user}
                                                        friend={friend}
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
                            friend={friend}
                            setMessages={setMessages}
                        />
                    </main>

                    <MemberList
                        channel={channel}
                        user={user}
                        friend={friend}
                    />
                </div>
            </div>
        ),
        [channel, friend, messages, loading, hasMore]
    );
};

const FirstMessage = ({ channel, user, friend }: Props) => {
    const { sendRequest } = useFetchHelper();

    return (
        <div className={styles.firstTimeMessageContainer}>
            <div className={styles.imageWrapper}>
                <Avatar
                    src={channel.icon as string}
                    alt={channel.name as string}
                    size={80}
                />
            </div>

            <h3 className={styles.friendUsername}>{channel.name}</h3>

            <div className={styles.descriptionContainer}>
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
                    <div className={styles.descriptionActions}>
                        {user.friendIds.includes(friend.id) ? (
                            <button
                                className="grey"
                                onClick={() =>
                                    sendRequest({
                                        query: "REMOVE_FRIEND",
                                        params: { username: friend.username },
                                    })
                                }
                            >
                                Remove Friend
                            </button>
                        ) : user.requestSentIds?.includes(friend.id) ? (
                            <button className="blue disabled">Friend Request Sent</button>
                        ) : user.requestReceivedIds?.includes(friend.id) ? (
                            <button
                                className="grey"
                                onClick={() =>
                                    sendRequest({
                                        query: "ADD_FRIEND",
                                        params: { username: friend.username },
                                    })
                                }
                            >
                                Accept Friend Request
                            </button>
                        ) : (
                            !user.blockedUserIds?.includes(friend.id) && (
                                <button
                                    className="blue"
                                    onClick={() =>
                                        sendRequest({
                                            query: "ADD_FRIEND",
                                            params: {
                                                username: friend.username,
                                            },
                                        })
                                    }
                                >
                                    Add Friend
                                </button>
                            )
                        )}

                        {!user.blockedUserIds?.includes(friend.id) ? (
                            <button
                                className="grey"
                                onClick={() =>
                                    sendRequest({
                                        query: "BLOCK_USER",
                                        params: { username: friend.username },
                                    })
                                }
                            >
                                Block
                            </button>
                        ) : (
                            <button
                                className="grey"
                                onClick={() =>
                                    sendRequest({
                                        query: "UNBLOCK_USER",
                                        params: { username: friend.username },
                                    })
                                }
                            >
                                Unblock
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Content;
