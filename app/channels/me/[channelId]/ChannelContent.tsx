'use client';

import { AppHeader, Message, TextArea, MemberList, MessageSkeleton, Avatar } from '@/app/app-components';
import { useState, useEffect, useCallback, ReactElement, useMemo } from 'react';
import useContextHook from '@/hooks/useContextHook';
import pusher from '@/lib/pusher/client-connection';
import useFetchHelper from '@/hooks/useFetchHelper';
import styles from './Channels.module.css';
import { v4 as uuidv4 } from 'uuid';

const ChannelContent = ({ channel }: { channel: TChannel | null }): ReactElement => {
    const [edit, setEdit] = useState<MessageEditObject | null>(null);
    const [reply, setReply] = useState<MessageReplyObject | null>(null);
    const [friend, setFriend] = useState<null | TCleanUser>(null);
    const [messages, setMessages] = useState<TMessage[]>([]);
    const [hasMore, setHasMore] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);

    const { auth }: any = useContextHook({ context: 'auth' });

    useEffect(() => {
        if (!channel) return;

        const localChannel = JSON.parse(localStorage.getItem(`channel-${channel.id}`) || '{}');

        if (localChannel?.edit) setEdit(localChannel.edit);
        if (localChannel?.reply) setReply(localChannel.reply);

        const getMessages = async () => {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BASE_URL}/users/me/channels/${channel.id}/messages`,
                {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${auth.accessToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            ).then((res) => res?.json());

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
                if (data.channelId !== channel.id || data.message.author.id === auth.user.id) return;
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
        };
    }, [channel, messages]);

    const scrollableContainer = useCallback(
        (node: HTMLDivElement) => {
            if (node) {
                setTimeout(() => {
                    node.scrollTop = node.scrollHeight;
                }, 100);
            }
        },
        [messages, loading, reply]
    );

    const moreThan5Minutes = (firstDate: Date, secondDate: Date) => {
        const diff = Math.abs(new Date(firstDate).getTime() - new Date(secondDate).getTime());

        return diff / (1000 * 60) >= 5;
    };

    const shouldBeLarge = (index: number) => {
        if (index === 0 || !['DEFAULT', 'REPLY'].includes(messages[index - 1].type)) {
            return true;
        }

        if (
            messages[index - 1].author.id !== messages[index].author.id ||
            moreThan5Minutes(messages[index - 1].createdAt, messages[index].createdAt)
        ) {
            return true;
        }

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
                                                    <div key={uuidv4()}>
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
                                                            last={index === messages.length - 1}
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
                            friend={friend}
                            reply={reply}
                            setReply={setReply}
                            setMessages={setMessages}
                        />
                    </main>

                    <MemberList channel={channel} />
                </div>
            </div>
        ),
        [channel, loading, edit, reply, messages, hasMore]
    );
};

const FirstMessage = ({ channel }: { channel: TChannel }) => {
    const { auth }: any = useContextHook({ context: 'auth' });
    const { sendRequest } = useFetchHelper();

    let friend: any;

    if (channel.type === 'DM') {
        friend = channel.recipients.find((recipient: any) => recipient.id !== auth.user.id);
    }

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
                        {auth.user.friendIds.includes(friend.id) ? (
                            <button
                                className='grey'
                                onClick={() =>
                                    sendRequest({
                                        query: 'REMOVE_FRIEND',
                                        params: { username: friend.username },
                                    })
                                }
                            >
                                Remove Friend
                            </button>
                        ) : auth.user.requestSentIds.includes(friend.id) ? (
                            <button className='blue disabled'>Friend Request Sent</button>
                        ) : auth.user.requestReceivedIds.includes(friend.id) ? (
                            <button
                                className='grey'
                                onClick={() =>
                                    sendRequest({
                                        query: 'ADD_FRIEND',
                                        params: { username: friend.username },
                                    })
                                }
                            >
                                Accept Friend Request
                            </button>
                        ) : (
                            !auth.user.blockedUserIds.includes(friend.id) && (
                                <button
                                    className='blue'
                                    onClick={() =>
                                        sendRequest({
                                            query: 'ADD_FRIEND',
                                            params: { username: friend.username },
                                        })
                                    }
                                >
                                    Add Friend
                                </button>
                            )
                        )}

                        {!auth.user.blockedUserIds.includes(friend.id) ? (
                            <button
                                className='grey'
                                onClick={() =>
                                    sendRequest({
                                        query: 'BLOCK_USER',
                                        params: { username: friend.username },
                                    })
                                }
                            >
                                Block
                            </button>
                        ) : (
                            <button
                                className='grey'
                                onClick={() =>
                                    sendRequest({
                                        query: 'UNBLOCK_USER',
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

export default ChannelContent;
