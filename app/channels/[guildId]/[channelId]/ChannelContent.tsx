'use client';

import { AppHeader, Message, TextArea, MemberList, MessageSkeleton, Icon } from '@/app/app-components';
import { useState, useEffect, useCallback, ReactElement, useMemo } from 'react';
import { shouldDisplayInlined } from '@/lib/message';
import useContextHook from '@/hooks/useContextHook';
import pusher from '@/lib/pusher/client-connection';
import useFetchHelper from '@/hooks/useFetchHelper';
import styles from './Channels.module.css';

const ChannelContent = ({ channel }: { channel: TChannel | null }): ReactElement => {
    const [edit, setEdit] = useState<MessageEditObject | null>(null);
    const [reply, setReply] = useState<MessageReplyObject | null>(null);
    const [messages, setMessages] = useState<TMessage[]>([]);
    const [hasMore, setHasMore] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [scrollToBottom, setScrollToBottom] = useState<boolean>(false);

    const { popup, fixedLayer }: any = useContextHook({ context: 'layer' });
    const { auth }: any = useContextHook({ context: 'auth' });

    useEffect(() => {
        if (!setEdit || !setReply || !channel) return;

        const setLocalStorage = (data: {}) => {
            localStorage.setItem(
                `channel-${channel.id}`,
                JSON.stringify({
                    ...JSON.parse(localStorage.getItem(`channel-${channel.id}`) || '{}'),
                    ...data,
                })
            );
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (popup || fixedLayer) return;

                if (edit) {
                    setEdit(null);
                    setLocalStorage({ edit: null });
                }

                if (reply) {
                    setReply(null);
                    setLocalStorage({ reply: null });
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [edit, popup, fixedLayer]);

    useEffect(() => {
        if (!channel) return;

        const localChannel = JSON.parse(localStorage.getItem(`channel-${channel.id}`) || '{}');

        if (localChannel?.edit) setEdit(localChannel.edit);
        if (localChannel?.reply) setReply(localChannel.reply);

        const getMessages = async () => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/channels/${channel.id}/messages`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${auth.accessToken}`,
                    'Content-Type': 'application/json',
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

        getMessages();
    }, [channel]);

    useEffect(() => {
        if (!channel) return;

        const listenSockets = () => {
            pusher.bind('message-sent', (data: any) => {
                if (
                    data.channelId !== channel.id ||
                    (data.message.author.id === auth.user.id && !shouldDisplayInlined(data.message.type))
                )
                    return;
                setMessages((messages) => [...messages, data.message]);
            });

            pusher.bind('message-edited', (data: any) => {
                if (data.channelId !== channel.id) return;
                setMessages((messages) =>
                    messages.map((message) => {
                        if (message.id === data.message.id) return data.message;
                        if (message.messageReferenceId === data.message.id)
                            return { ...message, messageReference: data.message };
                        return message;
                    })
                );
            });

            pusher.bind('message-deleted', (data: any) => {
                if (data.channelId !== channel.id) return;
                setMessages((messages) => {
                    return messages
                        .filter((message) => message.id !== data.messageId)
                        .map((message) => {
                            if (message.messageReferenceId === data.messageId) {
                                return { ...message, messageReference: null };
                            }
                            return message;
                        }) as TMessage[];
                });
            });

            pusher.bind('user-updated', (data: any) => {
                const object = {
                    username: data.username,
                    displayName: data.displayName,
                    description: data.description,
                    avatar: data.avatar,
                    banner: data.banner,
                    primaryColor: data.primaryColor,
                    accentColor: data.accentColor,
                    status: data.status,
                };

                const messagesUpdated = messages.map((message) => {
                    if (message.author.id === data.userId) {
                        return { ...message, author: { ...message.author, ...object } };
                    } else if (message.messageReference?.author.id === data.userId) {
                        return {
                            ...message,
                            messageReference: {
                                ...message.messageReference,
                                author: { ...message.messageReference.author, ...object },
                            },
                        };
                    } else if (
                        message.messageReference?.author.id === data.userId &&
                        message.author.id === data.userId
                    ) {
                        return {
                            ...message,
                            author: { ...message.author, ...object },
                            messageReference: {
                                ...message.messageReference,
                                author: { ...message.messageReference.author, ...object },
                            },
                        };
                    }
                    return message;
                });

                setMessages(messagesUpdated);
            });
        };

        listenSockets();

        return () => {
            pusher.unbind('message-sent');
            pusher.unbind('message-edited');
            pusher.unbind('message-deleted');
            pusher.unbind('user-updated');
        };
    }, [channel, messages]);

    const scrollableContainer = useCallback(
        (node: HTMLDivElement) => {
            if (node) {
                setTimeout(() => {
                    node.scrollTop = node.scrollHeight;
                }, 300);
            }
        },
        [loading, scrollToBottom]
    );

    useEffect(() => {
        const container = scrollableContainer;
        // @ts-ignore
        const isAtBottom = container?.scrollTop + container?.clientHeight === container?.scrollHeight;

        if (!isAtBottom) {
            setScrollToBottom((prev) => !prev);
        }
    }, [messages]);

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
                                className={styles.messagesScrollableContainer + ' scrollbar'}
                            >
                                <div className={styles.scrollContent}>
                                    <ol className={styles.scrollContentInner}>
                                        {loading || !channel ? (
                                            <MessageSkeleton />
                                        ) : (
                                            <>
                                                {hasMore ? <MessageSkeleton /> : <FirstMessage channel={channel} />}

                                                {messages?.map((message: TMessage, index: number) => (
                                                    <div key={message.id}>
                                                        {isNewDay(index) && (
                                                            <div className={styles.messageDivider}>
                                                                <span>
                                                                    {new Intl.DateTimeFormat('en-US', {
                                                                        weekday: 'long',
                                                                        year: 'numeric',
                                                                        month: 'long',
                                                                        day: 'numeric',
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

                    <MemberList channel={channel} />
                </div>
            </div>
        ),
        [channel, loading, messages, hasMore, edit, reply]
    );
};

const FirstMessage = ({ channel }: { channel: TChannel }) => {
    const { auth }: any = useContextHook({ context: 'auth' });
    const { sendRequest } = useFetchHelper();

    const guild = auth.user.guilds.find((guild: TGuild) => guild.id === channel.guildId);

    if (!guild) return;

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
                                more, check out our <a href=''>Getting Started guide</a>.
                            </div>
                        </div>

                        <div className={styles.welcomeCard}>
                            <div></div>
                            <div>Invite your friends</div>
                            <Icon name='arrowSmall' />
                        </div>

                        <div className={styles.welcomeCard}>
                            <div></div>
                            <div>Personalize your server with an icon</div>
                            <Icon name='arrowSmall' />
                        </div>

                        <div className={styles.welcomeCard}>
                            <div></div>
                            <div>Send your first message</div>
                            <Icon name='arrowSmall' />
                        </div>

                        <div className={styles.welcomeCard}>
                            <div></div>
                            <div>Add your first app</div>
                            <Icon name='arrowSmall' />
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

export default ChannelContent;
