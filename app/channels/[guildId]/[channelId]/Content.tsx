"use client";

import { AppHeader, Message, TextArea, MemberList, MessageSk, Icon } from "@components";
import { useState, useEffect, useCallback, ReactElement, useMemo } from "react";
import { shouldDisplayInlined } from "@/lib/message";
import { useData, useLayers } from "@/lib/store";
import styles from "./Channels.module.css";

interface Props {
    guild: TGuild;
    channel: TChannel;
}

const Content = ({ guild, channel }: Props): ReactElement => {
    const [edit, setEdit] = useState<MessageEditObject | null>(null);
    const [reply, setReply] = useState<MessageReplyObject | null>(null);
    const [messages, setMessages] = useState<TMessage[]>([]);
    const [hasMore, setHasMore] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [scrollToBottom, setScrollToBottom] = useState<boolean>(false);

    const layers = useLayers((state) => state.layers);
    const token = useData((state) => state.token);

    useEffect(() => {
        const setLocalStorage = (data: {}) => {
            localStorage.setItem(
                `channel-${channel.id}`,
                JSON.stringify({
                    ...JSON.parse(localStorage.getItem(`channel-${channel.id}`) || "{}"),
                    ...data,
                })
            );
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                if (edit && !layers.MENU) {
                    setEdit(null);
                    setLocalStorage({ edit: null });
                }

                if (reply && !layers.MENU) {
                    setReply(null);
                    setLocalStorage({ reply: null });
                }
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [edit, reply, layers.MENU]);

    useEffect(() => {
        const localChannel = JSON.parse(localStorage.getItem(`channel-${channel.id}`) || "{}");

        if (localChannel?.edit) setEdit(localChannel.edit);
        if (localChannel?.reply) setReply(localChannel.reply);

        const getMessages = async () => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/channels/${channel.id}/messages`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }).then((res) => res?.json());

            if (response.error) {
                console.log(response.error);
            } else {
                setMessages(response.messages);
                setHasMore(response.hasMore);
            }

            setLoading(false);
        };

        setLoading(true);
        getMessages();
    }, []);

    useEffect(() => {
        setScrollToBottom((prev) => !prev);
    }, [messages]);

    const scrollableContainer = useCallback(
        (node: HTMLDivElement) => {
            if (node) {
                node.scrollTop = node.scrollHeight;
            }
        },
        [loading, scrollToBottom]
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

    return useMemo(
        () => (
            <div className={styles.container}>
                <AppHeader channel={channel} />

                <div className={styles.content}>
                    <main className={styles.main}>
                        <div className={styles.messagesWrapper}>
                            <div
                                ref={scrollableContainer}
                                className={styles.messagesScrollableContainer + " scrollbar"}
                            >
                                <div className={styles.scrollContent}>
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
                                                            edit={edit}
                                                            setEdit={setEdit}
                                                            reply={reply}
                                                            setReply={setReply}
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
                            reply={reply}
                            setReply={setReply}
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
        [channel, loading, messages, hasMore, edit, reply]
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
