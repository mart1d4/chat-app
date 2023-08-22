'use client';

import { AppHeader, Message, TextArea, MemberList, MessageSk, Avatar } from '@components';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { shouldDisplayInlined } from '@/lib/message';
import useContextHook from '@/hooks/useContextHook';
import useFetchHelper from '@/hooks/useFetchHelper';
import styles from './Channels.module.css';
import { useLayers } from '@/lib/store';

type Props = {
    channel: TChannel;
    user: TCleanUser;
    friend: TCleanUser | null;
};

const Content = ({ channel, user, friend }: Props) => {
    const [edit, setEdit] = useState<MessageEditObject | null>(null);
    const [reply, setReply] = useState<MessageReplyObject | null>(null);
    const [messages, setMessages] = useState<TMessage[]>([]);
    const [hasMore, setHasMore] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [scrollToBottom, setScrollToBottom] = useState<boolean>(false);

    const { auth }: any = useContextHook({ context: 'auth' });
    const layers = useLayers((state) => state.layers);

    useEffect(() => {
        document.title = `Chat App | @${channel.name}`;
    }, []);

    useEffect(() => {
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

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [edit, reply, layers]);

    useEffect(() => {
        const localChannel = JSON.parse(localStorage.getItem(`channel-${channel.id}`) || '{}');

        if (localChannel?.edit) setEdit(localChannel.edit);
        if (localChannel?.reply) setReply(localChannel.reply);

        const getMessages = async () => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/channels/${channel.id}/messages`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${auth.token}`,
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

        setLoading(true);
        getMessages();
    }, []);

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
                <AppHeader
                    channel={channel}
                    friend={friend}
                />

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
                            friend={friend}
                            reply={reply}
                            setReply={setReply}
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
        [channel, friend, messages, loading, hasMore, edit, reply]
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
                        ) : user.requestSentIds?.includes(friend.id) ? (
                            <button className='blue disabled'>Friend Request Sent</button>
                        ) : user.requestReceivedIds?.includes(friend.id) ? (
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
                            !user.blockedUserIds?.includes(friend.id) && (
                                <button
                                    className='blue'
                                    onClick={() =>
                                        sendRequest({
                                            query: 'ADD_FRIEND',
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

export default Content;
