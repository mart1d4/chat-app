// @ts-nocheck

"use client";

import { Channel, Message as TMessage, User } from "@/lib/db/types";
import { Message, TextArea, MessageSk, Avatar } from "@components";
import { useData, useLayers, useUrls } from "@/lib/store";
import { useState, useEffect, useCallback } from "react";
import { shouldDisplayInlined } from "@/lib/message";
import useFetchHelper from "@/hooks/useFetchHelper";
import styles from "./Channels.module.css";
import Image from "next/image";

type TMessageData = {
    channelId: Channel["id"];
    message: TMessage;
    notSentByAuthor?: boolean;
};

type TMessageIdData = {
    channelId: Channel["id"];
    messageId: TMessage["id"];
};

type TUserUpdateData = {
    user: Partial<User>;
};

type Props = {
    channel: Channel;
    user: Partial<User>;
    friend?: Partial<User>;
    initMessages: TMessage[];
    messagesLoading: boolean;
};

const Content = ({
    channelId,
    user,
    friend,
    messagesLoading,
    initMessages,
    initHasMore,
}: Props) => {
    const [scrollerNode, setScrollerNode] = useState<HTMLDivElement | null>(null);
    const [isAtBottom, setIsAtBottom] = useState<boolean>(true);
    const [messages, setMessages] = useState<TMessage[]>(initMessages);
    const [hasMore, setHasMore] = useState<boolean>(initHasMore);
    const [loading, setLoading] = useState<boolean>(false);

    const setChannelUrl = useUrls((state) => state.setMe);
    const channels = useData((state) => state.channels);

    let channel;
    if (channelId) {
        channel = channels.find((c) => c.id === channelId);
    }

    useEffect(() => {
        document.title = `Chat App | @${channel.name}`;
        setChannelUrl(channel.id);
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

    return (
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
                            {loading || messagesLoading ? (
                                <MessageSk />
                            ) : (
                                <>
                                    {hasMore ? (
                                        <MessageSk />
                                    ) : (
                                        <FirstMessage
                                            user={user}
                                            friend={friend}
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
};

const FirstMessage = ({ channel, friend }: Props) => {
    const requestsR = useData((state) => state.requestsReceived).map((u) => u.id);
    const requestsS = useData((state) => state.requestsSent).map((u) => u.id);
    const friends = useData((state) => state.friends).map((u) => u.id);
    const blocked = useData((state) => state.blocked).map((u) => u.id);
    const setLayers = useLayers((state) => state.setLayers);
    const guilds = useData((state) => state.guilds);
    const { sendRequest } = useFetchHelper();

    const mutualGuilds = guilds.filter((guild) => guild.rawMemberIds.includes(friend?.id));
    const guildIcons = guilds.filter((guild) => !!guild.icon);

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
                        {mutualGuilds.length > 0 && (
                            <div className={styles.mutualGuildIcons}>
                                {guildIcons
                                    .map((guild) => (
                                        <Image
                                            key={guild.id}
                                            src={`${process.env.NEXT_PUBLIC_CDN_URL}/${guild.icon}/`}
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
                                onClick={(e) => {
                                    setLayers({
                                        settings: {
                                            type: "USER_PROFILE",
                                        },
                                        content: {
                                            user: friend,
                                            guilds: true,
                                        },
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
                                onClick={() =>
                                    sendRequest({
                                        query: "REMOVE_FRIEND",
                                        params: { username: friend.username },
                                    })
                                }
                            >
                                Remove Friend
                            </button>
                        ) : requestsS.includes(friend.id) ? (
                            <button className="button blue disabled">Friend Request Sent</button>
                        ) : requestsR.includes(friend.id) ? (
                            <button
                                className="button grey"
                                onClick={() =>
                                    sendRequest({
                                        query: "ADD_FRIEND",
                                        data: { username: friend.username },
                                    })
                                }
                            >
                                Accept Friend Request
                            </button>
                        ) : (
                            !blocked.includes(friend.id) && (
                                <button
                                    className="button blue"
                                    onClick={() =>
                                        sendRequest({
                                            query: "ADD_FRIEND",
                                            data: { username: friend.username },
                                        })
                                    }
                                >
                                    Add Friend
                                </button>
                            )
                        )}

                        {!blocked.includes(friend.id) ? (
                            <button
                                className="button grey"
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
                                className="button grey"
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
