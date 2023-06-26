'use client';

import { AppHeader, Message, TextArea, MemberList, MessageSkeleton, Avatar } from '@/app/app-components';
import { addFriend, blockUser, removeFriend, unblockUser } from '@/lib/api-functions/users';
import { useState, useEffect, useCallback, ReactElement, useRef, useMemo } from 'react';
import useContextHook from '@/hooks/useContextHook';
import pusher from '@/lib/pusher/connection';
import styles from './Channels.module.css';
import { v4 as uuidv4 } from 'uuid';

const ChannelContent = ({ channel }: { channel: ChannelType | null }): ReactElement => {
    const [edit, setEdit] = useState<MessageEditObject>({});
    const [reply, setReply] = useState<MessageReplyObject>({});
    const [friend, setFriend] = useState<null | CleanOtherUserType>(null);
    const [messages, setMessages] = useState<MessageType[]>([]);
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
            ).then((res) => res.json());

            if (response.error) {
                console.log(response.error);
            } else {
                setMessages(response.messages);
                setHasMore(response.hasMore);
            }

            setLoading(false);
        };

        const listenSockets = () => {
            pusher.bind(`message-sent`, (data: any) => {
                if (data.channel !== channel.id || data.message.author.id === auth.user.id) return;
                setMessages((messages) => [...messages, data.message]);
            });

            pusher.bind(`message-edited`, (data: any) => {
                if (data.channel !== channel.id) return;
                setMessages((messages) =>
                    messages.map((message) => (message.id === data.message.id ? data.message : message))
                );
            });

            pusher.bind(`message-deleted`, (data: any) => {
                if (data.channel !== channel.id) return;
                setMessages((messages) => messages.filter((message) => message.id !== data.messageId));
            });
        };

        getMessages();
        listenSockets();

        return () => {
            pusher.unbind('message-sent');
            pusher.unbind('message-edited');
            pusher.unbind('message-deleted');
        };
    }, [channel]);

    const scrollableContainer = useCallback(
        (node: HTMLDivElement) => {
            if (node) node.scrollTop = node.scrollHeight;
        },
        [messages, loading, edit, reply]
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

                                                {messages.map((message: MessageType, index: number) => (
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

const FirstMessage = ({ channel }: { channel: ChannelType }) => {
    const { auth }: any = useContextHook({ context: 'auth' });

    let friend: any;

    if (channel.type === 'DM') {
        friend = channel.recipients.find((recipient: any) => recipient.id !== auth.user.id);
    }

    return (
        <div className={styles.firstTimeMessageContainer}>
            <div className={styles.imageWrapper}>
                <Avatar
                    src={channel.icon as string}
                    alt={channel.name}
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
                                onClick={async () => await removeFriend(auth.accessToken, friend.username)}
                            >
                                Remove Friend
                            </button>
                        ) : auth.user.requestSentIds.includes(friend.id) ? (
                            <button className='blue disabled'>Friend Request Sent</button>
                        ) : auth.user.requestReceivedIds.includes(friend.id) ? (
                            <button
                                className='grey'
                                onClick={async () => await addFriend(auth.accessToken, friend.username)}
                            >
                                Accept Friend Request
                            </button>
                        ) : (
                            !auth.user.blockedUserIds.includes(friend.id) && (
                                <button
                                    className='blue'
                                    onClick={async () => await addFriend(auth.accessToken, friend.username)}
                                >
                                    Add Friend
                                </button>
                            )
                        )}

                        {!auth.user.blockedUserIds.includes(friend.id) ? (
                            <button
                                className='grey'
                                onClick={async () => await blockUser(auth.accessToken, friend.id)}
                            >
                                Block
                            </button>
                        ) : (
                            <button
                                className='grey'
                                onClick={async () => await unblockUser(auth.accessToken, friend.id)}
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
