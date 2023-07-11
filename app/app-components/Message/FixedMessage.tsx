'use client';

import useContextHook from '@/hooks/useContextHook';
import useFetchHelper from '@/hooks/useFetchHelper';
import styles from './FixedMessage.module.css';
import { Avatar } from '@/app/app-components';

const FixedMessage = ({ message, pinned }: { message: TMessage; pinned?: boolean }) => {
    const { setTooltip }: any = useContextHook({ context: 'tooltip' });
    const { sendRequest } = useFetchHelper();

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
                        onClick={() =>
                            sendRequest({
                                query: 'UNPIN_MESSAGE',
                                params: {
                                    channelId: message.channelId[0],
                                    messageId: message.id,
                                },
                            })
                        }
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
                        {message.messageReference ? (
                            <div className={styles.userAvatarReply}>
                                <Avatar
                                    src={message.messageReference?.author.avatar}
                                    alt={message.messageReference?.author.username}
                                    size={16}
                                />
                            </div>
                        ) : (
                            <div className={styles.noReplyBadge}>
                                <svg
                                    width='12'
                                    height='8'
                                    viewBox='0 0 12 8'
                                >
                                    <path
                                        d='M0.809739 3.59646L5.12565 0.468433C5.17446 0.431163 5.23323 0.408043 5.2951 0.401763C5.35698 0.395482 5.41943 0.406298 5.4752 0.432954C5.53096 0.45961 5.57776 0.50101 5.61013 0.552343C5.64251 0.603676 5.65914 0.662833 5.6581 0.722939V2.3707C10.3624 2.3707 11.2539 5.52482 11.3991 7.21174C11.4028 7.27916 11.3848 7.34603 11.3474 7.40312C11.3101 7.46021 11.2554 7.50471 11.1908 7.53049C11.1262 7.55626 11.0549 7.56204 10.9868 7.54703C10.9187 7.53201 10.857 7.49695 10.8104 7.44666C8.72224 5.08977 5.6581 5.63359 5.6581 5.63359V7.28135C5.65831 7.34051 5.64141 7.39856 5.60931 7.44894C5.5772 7.49932 5.53117 7.54004 5.4764 7.5665C5.42163 7.59296 5.3603 7.60411 5.29932 7.59869C5.23834 7.59328 5.18014 7.57151 5.13128 7.53585L0.809739 4.40892C0.744492 4.3616 0.691538 4.30026 0.655067 4.22975C0.618596 4.15925 0.599609 4.08151 0.599609 4.00269C0.599609 3.92386 0.618596 3.84612 0.655067 3.77562C0.691538 3.70511 0.744492 3.64377 0.809739 3.59646Z'
                                        fill='currentColor'
                                    />
                                </svg>
                            </div>
                        )}

                        {message.messageReference && <span>{message.messageReference?.author.displayName}</span>}

                        {message.messageReference ? (
                            <div>
                                {message.messageReference?.content}{' '}
                                {message.messageReference?.edited && (
                                    <div className={styles.contentTimestamp}>
                                        <span
                                            onMouseEnter={(e) =>
                                                setTooltip({
                                                    text: getLongDate(message.messageReference?.updatedAt),
                                                    element: e.currentTarget,
                                                    delay: 1000,
                                                })
                                            }
                                            onMouseLeave={() => setTooltip(null)}
                                            style={{ fontSize: '10px', opacity: 0.75 }}
                                        >
                                            (edited)
                                        </span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className={styles.italic}>Original message was deleted</div>
                        )}
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
                        <span className={styles.titleUsername}>{message.author?.displayName}</span>
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
