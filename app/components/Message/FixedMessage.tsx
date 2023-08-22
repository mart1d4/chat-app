'use client';

import { shouldDisplayInlined } from '@/lib/message';
import useContextHook from '@/hooks/useContextHook';
import { useLayers, useTooltip } from '@/lib/store';
import styles from './FixedMessage.module.css';
import { Avatar, Icon } from '@components';
import { useState, useMemo } from 'react';

export const FixedMessage = ({ message, pinned }: { message: TMessage; pinned?: boolean }) => {
    const setTooltip = useTooltip((state) => state.setTooltip);
    const setLayers = useLayers((state) => state.setLayers);
    const { auth }: any = useContextHook({ context: 'auth' });

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

    const inline = shouldDisplayInlined(message.type);

    const channel = auth.user.channels?.find((channel: TChannel) => channel.id === message.channelId);
    const guild = auth.user.guilds?.find((guild: TGuild) => guild.id === channel?.guildId);
    const regex: RegExp = /<@([a-zA-Z0-9]{24})>/g;

    let messageContent: JSX.Element | null = null;
    if (message.content) {
        const userIds: string[] = (message.content?.match(regex) || []).map((match: string) => match.slice(2, -1));
        messageContent = (
            <span>
                {message.content.split(regex).map((part, index) => {
                    if (userIds.includes(part)) {
                        const mentionUser = message.mentions?.find((user) => user.id === part);
                        return mentionUser ? (
                            <span
                                key={index}
                                className={inline ? styles.inlineMention : styles.mention}
                            >
                                {inline ? `${mentionUser.username}` : `@${mentionUser.username}`}
                            </span>
                        ) : (
                            <span
                                key={index}
                                className={inline ? styles.inlineMention : styles.mention}
                            >
                                @Unknown
                            </span>
                        );
                    } else {
                        return part;
                    }
                })}
            </span>
        );
    }

    let referencedContent: JSX.Element | null = null;
    if (message.messageReference?.content) {
        const userIds: string[] = (message.messageReference.content?.match(regex) || []).map((match: string) =>
            match.slice(2, -1)
        );
        referencedContent = (
            <span>
                {message.messageReference?.content.split(regex).map((part, index) => {
                    if (userIds.includes(part)) {
                        const mentionUser = message.mentions?.find((user) => user.id === part);
                        return mentionUser ? (
                            <span
                                key={index}
                                className={inline ? styles.inlineMention : styles.mention}
                            >
                                {inline ? `${mentionUser.username}` : `@${mentionUser.username}`}
                            </span>
                        ) : (
                            <span
                                key={index}
                                className={inline ? styles.inlineMention : styles.mention}
                            >
                                @Unknown
                            </span>
                        );
                    } else {
                        return part;
                    }
                })}
            </span>
        );
    }

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
                            setLayers({
                                settings: {
                                    type: 'POPUP',
                                },
                                content: {
                                    type: 'UNPIN_MESSAGE',
                                    channelId: message.channelId,
                                    message: message,
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
                {message.type === 1 && (
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

                        {message.messageReference && <span>{message.messageReference.author.displayName}</span>}

                        {referencedContent ? (
                            <div className={styles.referenceContent}>
                                {referencedContent}{' '}
                                {message.messageReference.edited && (
                                    <div className={styles.contentTimestamp}>
                                        <span
                                            onMouseEnter={(e) =>
                                                setTooltip({
                                                    text: getLongDate(message.updatedAt),
                                                    element: e.currentTarget,
                                                    delay: 1000,
                                                    wide: true,
                                                })
                                            }
                                            onMouseLeave={() => setTooltip(null)}
                                        >
                                            (edited)
                                        </span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className={styles.italic}>
                                {message.messageReference?.attachments.length > 0
                                    ? 'Click to see attachment'
                                    : 'Original message was deleted'}
                            </div>
                        )}

                        {message.messageReference?.attachments?.length > 0 && (
                            <Icon
                                name='image'
                                size={20}
                            />
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
                                    wide: true,
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
                        {messageContent && (
                            <>
                                {messageContent}{' '}
                                {message.edited && message.attachments.length === 0 && (
                                    <div className={styles.contentTimestamp}>
                                        <span
                                            onMouseEnter={(e) =>
                                                setTooltip({
                                                    text: getLongDate(message.updatedAt),
                                                    element: e.currentTarget,
                                                    delay: 1000,
                                                    wide: true,
                                                })
                                            }
                                            onMouseLeave={() => setTooltip(null)}
                                        >
                                            (edited)
                                        </span>
                                    </div>
                                )}
                            </>
                        )}

                        {message.attachments.length > 0 && <MessageAttachments message={message} />}

                        {message.edited && message.attachments.length > 0 && (
                            <div className={styles.contentTimestamp}>
                                <span
                                    onMouseEnter={(e) =>
                                        setTooltip({
                                            text: getLongDate(message.updatedAt),
                                            element: e.currentTarget,
                                            delay: 1000,
                                            wide: true,
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

const MessageAttachments = ({ message, functions }: any) => {
    return (
        <div className={styles.attachments}>
            <div>
                {message.attachments.length === 1 &&
                    message.attachments.slice(0, 1).map((attachment: TImageUpload) => (
                        <div
                            key={attachment.id}
                            className={styles.gridOneBig}
                        >
                            <Image
                                attachment={attachment}
                                message={message}
                            />
                        </div>
                    ))}

                {message.attachments.length == 2 && (
                    <div className={styles.gridTwo}>
                        {message.attachments.slice(0, 2).map((attachment: TImageUpload) => (
                            <Image
                                key={attachment.id}
                                attachment={attachment}
                                message={message}
                            />
                        ))}
                    </div>
                )}

                {message.attachments.length == 3 && (
                    <div className={styles.gridTwo}>
                        <div className={styles.gridOneSolo}>
                            {message.attachments.slice(0, 1).map((attachment: TImageUpload) => (
                                <Image
                                    key={attachment.id}
                                    attachment={attachment}
                                    message={message}
                                />
                            ))}
                        </div>

                        <div className={styles.gridTwoColumn}>
                            <div>
                                <div>
                                    {message.attachments.slice(1, 2).map((attachment: TImageUpload) => (
                                        <Image
                                            key={attachment.id}
                                            attachment={attachment}
                                            message={message}
                                        />
                                    ))}
                                </div>

                                <div>
                                    {message.attachments.slice(2, 3).map((attachment: TImageUpload) => (
                                        <Image
                                            key={attachment.id}
                                            attachment={attachment}
                                            message={message}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {message.attachments.length == 4 && (
                    <div className={styles.gridFour}>
                        {message.attachments.slice(0, 4).map((attachment: TImageUpload) => (
                            <Image
                                key={attachment.id}
                                attachment={attachment}
                                message={message}
                            />
                        ))}
                    </div>
                )}

                {message.attachments.length == 5 && (
                    <>
                        <div className={styles.gridTwo}>
                            {message.attachments.slice(0, 2).map((attachment: TImageUpload) => (
                                <Image
                                    key={attachment.id}
                                    attachment={attachment}
                                    message={message}
                                />
                            ))}
                        </div>

                        <div className={styles.gridThree}>
                            {message.attachments.slice(2, 5).map((attachment: TImageUpload) => (
                                <Image
                                    key={attachment.id}
                                    attachment={attachment}
                                    message={message}
                                />
                            ))}
                        </div>
                    </>
                )}

                {message.attachments.length == 6 && (
                    <div className={styles.gridThree}>
                        {message.attachments.slice(0, 6).map((attachment: TImageUpload) => (
                            <Image
                                key={attachment.id}
                                attachment={attachment}
                                message={message}
                            />
                        ))}
                    </div>
                )}

                {message.attachments.length == 7 && (
                    <>
                        <div className={styles.gridOne}>
                            {message.attachments.slice(0, 1).map((attachment: TImageUpload) => (
                                <Image
                                    key={attachment.id}
                                    attachment={attachment}
                                    message={message}
                                />
                            ))}
                        </div>

                        <div className={styles.gridThree}>
                            {message.attachments.slice(1, 7).map((attachment: TImageUpload) => (
                                <Image
                                    key={attachment.id}
                                    attachment={attachment}
                                    message={message}
                                />
                            ))}
                        </div>
                    </>
                )}

                {message.attachments.length == 8 && (
                    <>
                        <div className={styles.gridTwo}>
                            {message.attachments.slice(0, 2).map((attachment: TImageUpload) => (
                                <Image
                                    key={attachment.id}
                                    attachment={attachment}
                                    message={message}
                                />
                            ))}
                        </div>

                        <div className={styles.gridThree}>
                            {message.attachments.slice(2, 8).map((attachment: TImageUpload) => (
                                <Image
                                    key={attachment.id}
                                    attachment={attachment}
                                    message={message}
                                />
                            ))}
                        </div>
                    </>
                )}

                {message.attachments.length == 9 && (
                    <div className={styles.gridThree}>
                        {message.attachments.slice(0, 9).map((attachment: TImageUpload) => (
                            <Image
                                key={attachment.id}
                                attachment={attachment}
                                message={message}
                            />
                        ))}
                    </div>
                )}

                {message.attachments.length == 10 && (
                    <>
                        <div className={styles.gridOne}>
                            {message.attachments.slice(0, 1).map((attachment: TImageUpload) => (
                                <Image
                                    key={attachment.id}
                                    attachment={attachment}
                                    message={message}
                                />
                            ))}
                        </div>

                        <div className={styles.gridThree}>
                            {message.attachments.slice(1, 10).map((attachment: TImageUpload) => (
                                <Image
                                    key={attachment.id}
                                    attachment={attachment}
                                    message={message}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

type ImageComponent = {
    attachment: TImageUpload;
    message: TMessage;
};

const Image = ({ attachment, message }: ImageComponent) => {
    const [hideSpoiler, setHideSpoiler] = useState<boolean>(false);

    const setTooltip = useTooltip((state) => state.setTooltip);
    const setLayers = useLayers((state) => state.setLayers);

    return useMemo(
        () => (
            <div
                className={styles.image}
                onClick={() => {
                    if (attachment.isSpoiler && !hideSpoiler) {
                        return setHideSpoiler(true);
                    }

                    const index = message.attachments.findIndex((a) => a.id === attachment.id);

                    setLayers({
                        settings: {
                            type: 'POPUP',
                        },
                        content: {
                            type: 'ATTACHMENT_PREVIEW',
                            attachments: message.attachments,
                            current: index,
                        },
                    });
                }}
            >
                <div>
                    <div>
                        <div>
                            <div>
                                <img
                                    src={`${process.env.NEXT_PUBLIC_CDN_URL}${attachment.id}/-/resize/x${
                                        attachment.dimensions.height >= 350 ? 350 : attachment.dimensions.height
                                    }/-/format/webp/`}
                                    alt={attachment?.name}
                                    style={{
                                        filter: attachment.isSpoiler && !hideSpoiler ? 'blur(44px)' : 'none',
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {attachment.isSpoiler && !hideSpoiler && <div className={styles.spoilerButton}>Spoiler</div>}
                {attachment?.description && (!attachment.isSpoiler || hideSpoiler) && (
                    <button
                        className={styles.imageAlt}
                        onMouseEnter={(e) => {
                            e.stopPropagation();
                            setTooltip({
                                text: attachment.description,
                                element: e.currentTarget,
                                gap: 2,
                            });
                        }}
                        onMouseLeave={() => setTooltip(null)}
                    >
                        ALT
                    </button>
                )}
            </div>
        ),
        [attachment, hideSpoiler]
    );
};
