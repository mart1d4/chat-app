// @ts-nocheck

'use client';

import {
    // AppHeader,
    Message,
    TextArea,
    MemberList,
    MessageSkeleton,
} from '@/app/app-components';
import React, { useState, useEffect, useCallback, ReactNode } from 'react';
import useContextHook from '@/hooks/useContextHook';
import styles from './Channels.module.css';
import { v4 as uuidv4 } from 'uuid';
import Image from 'next/image';
import { addFriend, blockUser, removeFriend, unblockUser } from '@/lib/api-functions/users';

type Props = {
    channel: ChannelType;
    messages: MessageType[];
    hasMore: boolean;
};

const ChannelContent = ({ channel, messages, hasMore }: Props): ReactNode => {
    const [reply, setReply] = useState(null);
    const [edit, setEdit] = useState(null);
    const [friend, setFriend] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const { auth }: any = useContextHook({
        context: 'auth',
    });

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
        const diff = Math.abs(firstDate.getTime() - secondDate.getTime());

        return diff / (1000 * 60) >= 5;
    };

    const isBigMessage = (index: number) => {
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

        const firstDate = messages[index - 1].createdAt;
        const secondDate = messages[index].createdAt;

        return (
            firstDate.getDate() !== secondDate.getDate() ||
            firstDate.getMonth() !== secondDate.getMonth() ||
            firstDate.getFullYear() !== secondDate.getFullYear()
        );
    };

    const FirstMessage = (
        <div className={styles.firstTimeMessageContainer}>
            <div className={styles.imageWrapper}>
                <Image
                    src={friend ? `/assets/avatars/${friend.avatar}.png` : channel.icon}
                    alt={friend ? 'User Avatar' : 'Channel Icon'}
                    width={80}
                    height={80}
                />
            </div>

            <h3 className={styles.friendUsername}>{friend ? friend.username : channel.name}</h3>

            <div className={styles.descriptionContainer}>
                {friend ? (
                    <>
                        This is the beginning of your direct message history with
                        <strong> @{friend.username}</strong>.
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
                                onClick={() => removeFriend(friend.id)}
                            >
                                Remove Friend
                            </button>
                        ) : auth.user.requestSentIds.includes(friend.id) ? (
                            <button className='blue disabled'>Friend Request Sent</button>
                        ) : auth.user.requestReceivedIds.includes(friend.id) ? (
                            <button
                                className='grey'
                                onClick={() => addFriend(friend.id)}
                            >
                                Accept Friend Request
                            </button>
                        ) : (
                            !auth.user.blockedUserIds.includes(friend.id) && (
                                <button
                                    className='blue'
                                    onClick={() => addFriend(friend.id)}
                                >
                                    Add Friend
                                </button>
                            )
                        )}

                        {!auth.user.blockedUserIds.includes(friend.id) ? (
                            <button
                                className='grey'
                                onClick={() => blockUser(friend.id)}
                            >
                                Block
                            </button>
                        ) : (
                            <button
                                className='grey'
                                onClick={() => unblockUser(friend.id)}
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
            {/* <AppHeader channel={channel} /> */}

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

                                            {messages.map((message, index) => (
                                                <div key={uuidv4()}>
                                                    {isNewDay(index) && (
                                                        <div className={styles.messageDivider}>
                                                            <span>
                                                                {new Intl.DateTimeFormat('en-US', {
                                                                    weekday: 'long',
                                                                    year: 'numeric',
                                                                    month: 'long',
                                                                    day: 'numeric',
                                                                }).format(message.createdAt)}
                                                            </span>
                                                        </div>
                                                    )}

                                                    <Message
                                                        channel={channel}
                                                        message={message}
                                                        start={isBigMessage(index)}
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
                    />
                </main>

                <MemberList channel={channel} />
            </div>
        </div>
    );
};

export default ChannelContent;
