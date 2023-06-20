'use client';

import {
    AppHeader,
    Message,
    TextArea,
    MemberList,
    MessageSkeleton,
    Avatar,
} from '@/app/app-components';
import { addFriend, blockUser, removeFriend, unblockUser } from '@/lib/api-functions/users';
import React, { useState, useEffect, useCallback, ReactElement, useRef } from 'react';
import useContextHook from '@/hooks/useContextHook';
import useAuthSWR from '@/hooks/useAuthSWR';
import styles from './Channels.module.css';
import { v4 as uuidv4 } from 'uuid';
import Pusher from 'pusher-js';

const ChannelContent = ({ channel }: { channel: ChannelType }): ReactElement => {
    const [reply, setReply] = useState<null | {
        channelId: string;
        messageId: string;
        author: CleanOtherUserType;
    }>(null);
    const [edit, setEdit] = useState<null | { messageId: string; content: string }>(null);
    const [friend, setFriend] = useState<null | CleanOtherUserType>(null);
    const [messages, setMessages] = useState<MessageType[]>([]);

    const { data, isLoading } = useAuthSWR(`/users/me/channels/${channel.id}/messages`);
    const ref = useRef<boolean>(false);
    const pusherChannels = useRef<Pusher | null>(null);

    useEffect(() => {
        if (!data) return;
        setMessages(data?.messages || []);
    }, [data]);

    const hasMore = data?.hasMore || false;

    const { auth }: any = useContextHook({ context: 'auth' });
    const token = auth.accessToken;

    useEffect(() => {
        if (ref.current) {
            pusherChannels.current = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY as string, {
                cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER as string,
            });
            setPusherListener();
        }

        return () => {
            ref.current = true;
            pusherChannels.current?.unsubscribe('chat-app');
        };
    }, []);

    const setPusherListener = () => {
        const pusherChan = pusherChannels.current?.subscribe('chat-app');

        pusherChan?.bind(`message-sent`, (data: any) => {
            if (data.channel !== channel.id || data.message.author.id === auth.user.id) return;
            setMessages((messages) => [...messages, data.message]);
        });

        pusherChan?.bind(`message-edited`, (data: any) => {
            if (data.channel !== channel.id) return;
            setMessages((messages) =>
                messages.map((message) => (message.id === data.message.id ? data.message : message))
            );
        });

        pusherChan?.bind(`message-deleted`, (data: any) => {
            console.log('Mess del: ', data.channel, data.messageId);
            if (data.channel !== channel.id) return;
            setMessages((messages) => messages.filter((message) => message.id !== data.messageId));
        });
    };

    const scrollableContainer = useCallback(
        (node: HTMLDivElement) => {
            if (node) node.scrollTop = node.scrollHeight;
        },
        [messages]
    );

    useEffect(() => {
        localStorage.setItem('channel-url', `/channels/me/${channel.id}`);

        const localChannel = JSON.parse(localStorage.getItem(`channel-${channel.id}`) || '{}');

        if (localChannel?.edit) setEdit(localChannel.edit);
        if (localChannel?.reply) setReply(localChannel.reply);

        if (channel.type === 'DM') {
            const friend = channel.recipients.find(
                (recipient: any) => recipient.id !== auth.user.id
            );

            setFriend(friend as any);
        }
    }, [channel]);

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

    const FirstMessage = (
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
                                onClick={async () => await removeFriend(token, friend.username)}
                            >
                                Remove Friend
                            </button>
                        ) : auth.user.requestSentIds.includes(friend.id) ? (
                            <button className='blue disabled'>Friend Request Sent</button>
                        ) : auth.user.requestReceivedIds.includes(friend.id) ? (
                            <button
                                className='grey'
                                onClick={async () => await addFriend(token, friend.username)}
                            >
                                Accept Friend Request
                            </button>
                        ) : (
                            !auth.user.blockedUserIds.includes(friend.id) && (
                                <button
                                    className='blue'
                                    onClick={async () => await addFriend(token, friend.username)}
                                >
                                    Add Friend
                                </button>
                            )
                        )}

                        {!auth.user.blockedUserIds.includes(friend.id) ? (
                            <button
                                className='grey'
                                onClick={async () => await blockUser(token, friend.id)}
                            >
                                Block
                            </button>
                        ) : (
                            <button
                                className='grey'
                                onClick={async () => await unblockUser(token, friend.id)}
                            >
                                Unblock
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );

    return (
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
                                    {isLoading ? (
                                        <MessageSkeleton />
                                    ) : (
                                        <>
                                            {hasMore ? <MessageSkeleton /> : FirstMessage}

                                            {messages.map((message: any, index: number) => (
                                                <div key={uuidv4()}>
                                                    {isNewDay(index) && (
                                                        <div className={styles.messageDivider}>
                                                            <span>
                                                                {new Intl.DateTimeFormat('en-US', {
                                                                    weekday: 'long',
                                                                    year: 'numeric',
                                                                    month: 'long',
                                                                    day: 'numeric',
                                                                }).format(
                                                                    new Date(message.createdAt)
                                                                )}
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
    );
};

export default ChannelContent;
