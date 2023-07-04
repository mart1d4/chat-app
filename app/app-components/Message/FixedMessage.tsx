'use client';

import useContextHook from '@/hooks/useContextHook';
import styles from './FixedMessage.module.css';
import { Avatar } from '@/app/app-components';

const FixedMessage = ({ message, pinned }: { message: TMessage; pinned?: boolean }) => {
    const { setTooltip }: any = useContextHook({ context: 'tooltip' });

    const getLongDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
        }).format(new Date(date));
    };

    const getMidDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'numeric',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
        }).format(new Date(date));
    };

    return (
        <li className={styles.messageContainer}>
            {pinned && (
                <div className={styles.hoverContainer}>
                    <div role='button'>
                        <div>Jump</div>
                    </div>

                    <svg
                        aria-hidden='true'
                        role='img'
                        width='24'
                        height='24'
                        viewBox='0 0 24 24'
                    >
                        <path
                            fill='currentColor'
                            d='M18.4 4L12 10.4L5.6 4L4 5.6L10.4 12L4 18.4L5.6 20L12 13.6L18.4 20L20 18.4L13.6 12L20 5.6L18.4 4Z'
                        />
                    </svg>
                </div>
            )}

            <div>
                {message.type === 'REPLY' && (
                    <div className={styles.messageReply}>
                        <div className={styles.userAvatarReply}>
                            <Avatar
                                src={message.messageReference?.author.avatar}
                                alt={message.messageReference?.author.username}
                                size={16}
                            />
                        </div>

                        <span>{message.messageReference?.author.username}</span>
                        <div>{message.messageReference?.content}</div>
                    </div>
                )}

                <div className={styles.messageContent}>
                    <div className={styles.userAvatar}>
                        <Avatar
                            src={message.author.avatar}
                            alt={message.author.username}
                            size={40}
                        />
                    </div>

                    <h3>
                        <span className={styles.titleUsername}>{message.author?.username}</span>
                        <span
                            className={styles.titleTimestamp}
                            onMouseEnter={(e) =>
                                setTooltip({
                                    text: getLongDate(message.createdAt),
                                    element: e.currentTarget,
                                    delay: 1000,
                                })
                            }
                            onMouseLeave={() => setTooltip(null)}
                        >
                            {getMidDate(message.createdAt)}
                        </span>
                    </h3>

                    <div
                        style={{
                            whiteSpace: 'pre-line',
                            opacity: message.waiting ? 0.5 : 1,
                            color: message.error ? 'var(--error-1)' : '',
                        }}
                    >
                        {message.content}{' '}
                        {message.edited && (
                            <div className={styles.contentTimestamp}>
                                <span
                                    onMouseEnter={(e) =>
                                        setTooltip({
                                            text: getLongDate(message.updatedAt),
                                            element: e.currentTarget,
                                            delay: 1000,
                                        })
                                    }
                                    onMouseLeave={() => setTooltip(null)}
                                >
                                    (edited)
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </li>
    );
};

export default FixedMessage;
