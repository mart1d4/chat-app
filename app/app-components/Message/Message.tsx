'use client';

import { ComputableProgressInfo, UnknownProgressInfo, uploadFileGroup } from '@uploadcare/upload-client';
import { TextArea, Icon, Avatar } from '@/app/app-components';
import { useEffect, useState, useMemo, useRef } from 'react';
import useContextHook from '@/hooks/useContextHook';
import useFetchHelper from '@/hooks/useFetchHelper';
import { trimMessage } from '@/lib/strings';
import styles from './Message.module.css';

type Props = {
    message: TMessage;
    setMessages: React.Dispatch<React.SetStateAction<TMessage[]>>;
    large: boolean;
    last?: boolean;
    edit?: MessageEditObject | null;
    setEdit?: React.Dispatch<React.SetStateAction<MessageEditObject | null>>;
    reply?: MessageReplyObject | null;
    setReply?: React.Dispatch<React.SetStateAction<MessageReplyObject | null>>;
};

const Message = ({ message, setMessages, large, edit, setEdit, reply, setReply }: Props) => {
    const [editContent, setEditContent] = useState<string>(message.content || '');
    const [fileProgress, setFileProgress] = useState<number>(0);

    const { fixedLayer, setFixedLayer, setPopup }: any = useContextHook({ context: 'layer' });
    const { setTooltip }: any = useContextHook({ context: 'tooltip' });
    const { auth }: any = useContextHook({ context: 'auth' });
    const { sendRequest } = useFetchHelper();

    const controller = useMemo(() => new AbortController(), []);
    const hasRendered = useRef(false);

    const shouldDisplayInlined = () => {
        const inlineTypes = [
            'RECIPIENT_ADD',
            'RECIPIENT_REMOVE',
            'CALL',
            'CHANNEL_NAME_CHANGE',
            'CHANNEL_ICON_CHANGE',
            'CHANNEL_PINNED_MESSAGE',
            'GUILD_MEMBER_JOIN',
            'OWNER_CHANGE',
        ];

        return inlineTypes.includes(message.type);
    };

    const channel = auth.user.channels?.find((channel: TChannel) => channel.id === message.channelId[0]);
    const guild = auth.user.guilds?.find((guild: TGuild) => guild.id === channel?.guildId);
    const userRegex: RegExp = /<([@#\-*])([a-zA-Z0-9]{6,24})>/g;

    let messageContent: JSX.Element | null = null;
    if (message.content) {
        const userIds: string[] = (message.content?.match(userRegex) || []).map((match: string) => match.slice(2, -1));

        messageContent = (
            <span>
                {message.content.split(userRegex).map((part, index) => {
                    if (userIds.includes(part)) {
                        console.log(part);
                        const mentionUser = message.mentions?.find((user) => user.id === part);

                        return mentionUser ? (
                            <span
                                className={shouldDisplayInlined() ? styles.inlineMention : styles.mention}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (fixedLayer?.element === e.currentTarget) return;
                                    setFixedLayer({
                                        type: 'usercard',
                                        user: mentionUser,
                                        element: e.currentTarget,
                                        firstSide: 'RIGHT',
                                        gap: 10,
                                    });
                                }}
                                onContextMenu={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (fixedLayer?.element === e.currentTarget) return;
                                    setFixedLayer({
                                        type: 'menu',
                                        menu: 'USER',
                                        event: {
                                            mouseX: e.clientX,
                                            mouseY: e.clientY,
                                        },
                                        user: mentionUser,
                                    });
                                }}
                            >
                                {shouldDisplayInlined() ? `${mentionUser.username}` : `@${mentionUser.username}`}
                            </span>
                        ) : (
                            <span className={shouldDisplayInlined() ? styles.inlineMention : styles.mention}>
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
        const userIds: string[] = (message.messageReference.content?.match(userRegex) || []).map((match: string) =>
            match.slice(2, -1)
        );
        referencedContent = (
            <span>
                {message.messageReference?.content.split(userRegex).map((part, index) => {
                    if (userIds.includes(part)) {
                        const mentionUser = message.mentions?.find((user) => user.id === part);
                        return mentionUser ? (
                            <span
                                key={index}
                                className={shouldDisplayInlined() ? styles.inlineMention : styles.mention}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (fixedLayer?.element === e.currentTarget) return;
                                    setFixedLayer({
                                        type: 'usercard',
                                        user: mentionUser,
                                        element: e.currentTarget,
                                        firstSide: 'RIGHT',
                                        gap: 10,
                                    });
                                }}
                                onContextMenu={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (fixedLayer?.element === e.currentTarget) return;
                                    setFixedLayer({
                                        type: 'menu',
                                        menu: 'USER',
                                        event: {
                                            mouseX: e.clientX,
                                            mouseY: e.clientY,
                                        },
                                        user: mentionUser,
                                    });
                                }}
                            >
                                {shouldDisplayInlined() ? `${mentionUser.username}` : `@${mentionUser.username}`}
                            </span>
                        ) : (
                            <span
                                key={index}
                                className={shouldDisplayInlined() ? styles.inlineMention : styles.mention}
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

    useEffect(() => {
        if (!setEdit || !setReply) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                if (!edit || edit?.messageId !== message.id) return;
                e.preventDefault();
                e.stopPropagation();
                sendEditedMessage();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [edit]);

    const deleteLocalMessage = async () => {
        setMessages((messages) => messages.filter((m) => m.id !== message.id));
    };

    const retrySendMessage = async (prevMessage: TMessage) => {
        if (!prevMessage || (!prevMessage.waiting && !prevMessage.error && !prevMessage.needsToBeSent)) return;

        const tempMessage = {
            id: prevMessage.id,
            content: prevMessage.content,
            attachments: prevMessage.attachments,
            author: prevMessage.author,
            channelId: [prevMessage.channelId[0]],
            messageReference: prevMessage.messageReference,
            createdAt: new Date(),
            error: false,
            waiting: true,
            needsToBeSent: false,
        } as TMessage;

        deleteLocalMessage();
        setMessages((messages: TMessage[]) => [...messages, tempMessage]);

        let uploadedFiles: any = [];

        try {
            if (prevMessage.attachments.length > 0) {
                const onProgress = (props: ComputableProgressInfo | UnknownProgressInfo) => {
                    if ('value' in props) {
                        setFileProgress(props.value);
                    }
                };

                const filesToAdd = prevMessage.attachments.map((file) => file.file);

                await uploadFileGroup(filesToAdd, {
                    publicKey: process.env.NEXT_PUBLIC_CDN_TOKEN as string,
                    store: 'auto',
                    onProgress,
                    signal: controller.signal,
                })
                    .then((result) => {
                        uploadedFiles = result.files.map((file, index) => {
                            return {
                                id: file.uuid,
                                dimensions: prevMessage.attachments[index].dimensions,
                                name: prevMessage.attachments[index].file.name,
                                isSpoiler: prevMessage.attachments[index].file.name.startsWith('SPOILER_'),
                                description: prevMessage.attachments[index].description,
                            };
                        });
                    })
                    .catch((error) => {
                        console.error(error);
                        // @ts-expect-error
                        setMessages((prev: TMessage[]) => {
                            return prev.map((message) =>
                                message.id === prevMessage.id ? { ...message, error: true, waiting: false } : message
                            );
                        });

                        setPopup({
                            type: 'WARNING',
                            warning: 'UPLOAD_FAILED',
                        });
                    });
            }

            const response = await sendRequest({
                query: 'SEND_MESSAGE',
                params: { channelId: prevMessage.channelId[0] },
                data: {
                    message: {
                        content: prevMessage.content,
                        attachments: uploadedFiles,
                        messageReference: prevMessage.messageReference,
                    },
                },
            });

            if (!response.success) {
                // @ts-expect-error
                setMessages((prev: TMessage[]) => {
                    return prev.map((message) =>
                        message.id === prevMessage.id ? { ...message, error: true, waiting: false } : message
                    );
                });

                if (prevMessage.attachments.length > 0) {
                    setPopup({
                        type: 'WARNING',
                        warning: 'UPLOAD_FAILED',
                    });
                }

                return;
            }

            const message = response.data.message;

            setMessages((messages: TMessage[]) => messages.filter((message) => message.id !== prevMessage.id));
            setMessages((messages: TMessage[]) => [...messages, message]);
        } catch (error) {
            console.error(error);
            // @ts-expect-error
            setMessages((prev: TMessage[]) => {
                return prev.map((message) =>
                    message.id === prevMessage.id ? { ...message, error: true, waiting: false } : message
                );
            });

            if (prevMessage.attachments.length > 0) {
                setPopup({
                    type: 'WARNING',
                    warning: 'UPLOAD_FAILED',
                });
            }
        }
    };

    useEffect(() => {
        if (message?.needsToBeSent && hasRendered.current) {
            retrySendMessage(message);
        }

        return () => {
            hasRendered.current = true;
        };
    }, [message]);

    const setLocalStorage = (data: {}) => {
        localStorage.setItem(
            `channel-${message.channelId[0]}`,
            JSON.stringify({
                ...JSON.parse(localStorage.getItem(`channel-${message.channelId[0]}`) || '{}'),
                ...data,
            })
        );
    };

    const deletePopup = () => {
        setPopup({
            type: 'DELETE_MESSAGE',
            channelId: message.channelId[0],
            message: message,
        });
    };

    const pinPopup = () => {
        setPopup({
            type: 'PIN_MESSAGE',
            channelId: message.channelId[0],
            message: message,
        });
    };

    const unpinPopup = () => {
        setPopup({
            type: 'UNPIN_MESSAGE',
            channelId: message.channelId[0],
            message: message,
        });
    };

    const editMessageState = async () => {
        if (!setEdit) return;

        setEdit({
            messageId: message.id,
            content: message.content || '',
        });

        setLocalStorage({
            edit: {
                messageId: message.id,
                content: message.content || '',
            },
        });
    };

    const sendEditedMessage = async () => {
        if (!setEdit) return;
        const content = trimMessage(editContent) ?? null;

        if (content === null && message.attachments.length === 0) {
            setPopup({
                type: 'DELETE_MESSAGE',
                channelId: message.channelId[0],
                message: message,
            });

            setTimeout(() => {
                setEdit(null);
                setLocalStorage({ edit: null });
            }, 1000);

            return;
        }

        try {
            sendRequest({
                query: 'UPDATE_MESSAGE',
                params: {
                    channelId: message.channelId[0],
                    messageId: message.id,
                },
                data: { content: content },
            });

            setEdit(null);
            setLocalStorage({ edit: null });
        } catch (error) {
            console.error(error);
        }
    };

    const replyToMessageState = () => {
        if (!setReply) return;

        setReply({
            channelId: message.channelId[0],
            messageId: message.id,
            author: message.author,
        });

        setLocalStorage({
            reply: {
                channelId: message.channelId[0],
                messageId: message.id,
                author: message.author,
            },
        });
    };

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

    const getShortDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            minute: 'numeric',
        }).format(new Date(date));
    };

    const functions = {
        deletePopup,
        pinPopup,
        unpinPopup,
        editMessageState,
        replyToMessageState,
        deleteLocalMessage,
        retrySendMessage,
    };

    if (shouldDisplayInlined()) {
        return (
            <li
                className={
                    styles.messageContainer +
                    ' ' +
                    styles.inlined +
                    ' ' +
                    (reply?.messageId === message.id ? styles.reply : '')
                }
                onContextMenu={(e) => {
                    e.preventDefault();
                    setFixedLayer({
                        type: 'menu',
                        menu: 'MESSAGE',
                        event: {
                            mouseX: e.clientX,
                            mouseY: e.clientY,
                        },
                        message: {
                            ...message,
                            inline: true,
                        },
                        deletePopup,
                        replyToMessageState,
                    });
                }}
                style={{
                    backgroundColor: fixedLayer?.message?.id === message.id ? 'var(--background-hover-4)' : '',
                    marginTop: large ? '1.0625rem' : '',
                }}
            >
                <MessageMenu
                    message={message}
                    large={false}
                    functions={functions}
                />

                <div className={styles.message}>
                    <div className={styles.specialIcon}>
                        <div
                            style={{
                                backgroundImage: `url(/assets/app/message/${
                                    message.type === 'RECIPIENT_ADD'
                                        ? 'join'
                                        : message.type === 'RECIPIENT_REMOVE'
                                        ? 'leave'
                                        : message.type === 'CHANNEL_PINNED_MESSAGE'
                                        ? 'pin'
                                        : 'edit'
                                }.svg)`,
                                width: '1rem',
                                height: '1rem',
                                backgroundSize: '1rem 1rem',
                                backgroundRepeat: 'no-repeat',
                            }}
                        />
                    </div>

                    <div className={styles.messageContent}>
                        <div
                            style={{
                                whiteSpace: 'pre-line',
                                opacity: message.waiting ? 0.5 : 1,
                                color: message.error ? 'var(--error-1)' : '',
                            }}
                        >
                            {messageContent ? messageContent : ''}{' '}
                            <span
                                className={styles.contentTimestamp}
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
                                <span style={{ userSelect: 'text' }}>{getMidDate(message.createdAt)}</span>
                            </span>
                        </div>
                    </div>
                </div>
            </li>
        );
    }

    return useMemo(
        () =>
            message?.needsToBeSent ? (
                <></>
            ) : (
                <li
                    className={
                        styles.messageContainer +
                        ' ' +
                        (large ? styles.large : '') +
                        ' ' +
                        (reply?.messageId === message.id ? styles.reply : '')
                    }
                    onContextMenu={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (edit?.messageId === message.id || message.waiting || message.error) return;
                        setFixedLayer({
                            type: 'menu',
                            menu: 'MESSAGE',
                            event: {
                                mouseX: e.clientX,
                                mouseY: e.clientY,
                            },
                            message: message,
                            functions: functions,
                        });
                    }}
                    style={{
                        backgroundColor: fixedLayer?.message?.id === message.id ? 'var(--background-hover-4)' : '',
                    }}
                >
                    <MessageMenu
                        message={message}
                        large={large}
                        functions={functions}
                    />

                    <div className={styles.message}>
                        {message.type === 'REPLY' && (
                            <div className={styles.messageReply}>
                                {message.messageReference ? (
                                    <div
                                        className={styles.userAvatarReply}
                                        onDoubleClick={(e) => e.stopPropagation()}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (!message.messageReference) return;
                                            if (fixedLayer?.e?.currentTarget === e.currentTarget) {
                                                setFixedLayer(null);
                                            } else {
                                                setFixedLayer({
                                                    type: 'usercard',
                                                    event: {
                                                        mouseX: e.clientX,
                                                        mouseY: e.clientY,
                                                    },
                                                    user: message.messageReference?.author,
                                                    element: e.currentTarget,
                                                    firstSide: 'RIGHT',
                                                    gap: 10,
                                                });
                                            }
                                        }}
                                        onContextMenu={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            if (!message.messageReference) return;
                                            setFixedLayer({
                                                type: 'menu',
                                                menu: 'USER',
                                                event: {
                                                    mouseX: e.clientX,
                                                    mouseY: e.clientY,
                                                },
                                                user: message.messageReference?.author,
                                            });
                                        }}
                                    >
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

                                {message.messageReference && (
                                    <span
                                        onDoubleClick={(e) => e.stopPropagation()}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (fixedLayer?.element === e.currentTarget) {
                                                setFixedLayer(null);
                                            } else {
                                                setFixedLayer({
                                                    type: 'usercard',
                                                    user: message.messageReference.author,
                                                    element: e.currentTarget,
                                                    firstSide: 'RIGHT',
                                                    gap: 10,
                                                });
                                            }
                                        }}
                                        onContextMenu={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setFixedLayer({
                                                type: 'menu',
                                                menu: 'USER',
                                                event: {
                                                    mouseX: e.clientX,
                                                    mouseY: e.clientY,
                                                },
                                                user: message.messageReference.author,
                                            });
                                        }}
                                    >
                                        {message.messageReference.author.displayName}
                                    </span>
                                )}

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

                        <div
                            className={styles.messageContent}
                            onDoubleClick={() => {
                                if (message.author.id === auth.user.id) {
                                    editMessageState();
                                } else {
                                    if (reply?.messageId === message.id) return;
                                    replyToMessageState();
                                }
                            }}
                        >
                            {large && (
                                <div
                                    className={styles.userAvatar}
                                    onClick={(e) => {
                                        if (fixedLayer?.element === e.currentTarget) {
                                            setFixedLayer(null);
                                            return;
                                        }

                                        setFixedLayer({
                                            type: 'usercard',
                                            user: message?.author,
                                            element: e.currentTarget,
                                            firstSide: 'RIGHT',
                                            gap: 10,
                                        });
                                    }}
                                    onDoubleClick={(e) => e.stopPropagation()}
                                    onContextMenu={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setFixedLayer({
                                            type: 'menu',
                                            menu: 'USER',
                                            event: {
                                                mouseX: e.clientX,
                                                mouseY: e.clientY,
                                            },
                                            user: message.author,
                                        });
                                    }}
                                >
                                    <Avatar
                                        src={message.author.avatar}
                                        alt={message.author.username}
                                        size={40}
                                    />
                                </div>
                            )}

                            {large && (
                                <h3>
                                    <span
                                        className={styles.titleUsername}
                                        onDoubleClick={(e) => e.stopPropagation()}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (fixedLayer?.element === e.currentTarget) {
                                                setFixedLayer(null);
                                            } else {
                                                setFixedLayer({
                                                    type: 'usercard',
                                                    user: message.author,
                                                    element: e.currentTarget,
                                                    firstSide: 'RIGHT',
                                                    gap: 10,
                                                });
                                            }
                                        }}
                                        onContextMenu={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setFixedLayer({
                                                type: 'menu',
                                                menu: 'USER',
                                                event: {
                                                    mouseX: e.clientX,
                                                    mouseY: e.clientY,
                                                },
                                                user: message.author,
                                            });
                                        }}
                                    >
                                        {message.author?.displayName}
                                    </span>

                                    {message.waiting && <span className={styles.titleTimestamp}>Sending...</span>}
                                    {message.error && <span className={styles.titleTimestamp}>Error Sending</span>}

                                    {!message.waiting && !message.error && (
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
                                    )}
                                </h3>
                            )}

                            {!large && (
                                <span
                                    className={styles.messageTimestamp}
                                    style={{
                                        visibility: fixedLayer?.message?.id === message.id ? 'visible' : undefined,
                                    }}
                                >
                                    <span
                                        onMouseEnter={(e) =>
                                            setTooltip({
                                                text: getLongDate(message.createdAt),
                                                element: e.currentTarget,
                                                gap: 2,
                                                delay: 1000,
                                                wide: true,
                                            })
                                        }
                                        onMouseLeave={() => setTooltip(null)}
                                    >
                                        {getShortDate(message.createdAt)}
                                    </span>
                                </span>
                            )}

                            <div
                                style={{
                                    whiteSpace: 'pre-line',
                                    opacity: message.waiting && message?.attachments?.length === 0 ? 0.5 : 1,
                                    color: message.error ? 'var(--error-1)' : '',
                                }}
                            >
                                {edit?.messageId === message.id ? (
                                    <>
                                        <TextArea
                                            channel={message.channelId[0]}
                                            editContent={editContent}
                                            setEditContent={setEditContent}
                                        />

                                        <div className={styles.editHint}>
                                            escape to{' '}
                                            <span
                                                onClick={() => {
                                                    if (!setEdit) return;
                                                    setEdit(null);
                                                    setLocalStorage({ edit: null });
                                                }}
                                            >
                                                cancel{' '}
                                            </span>
                                            • enter to <span onClick={() => sendEditedMessage()}>save </span>
                                        </div>
                                    </>
                                ) : (
                                    messageContent && (
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
                                    )
                                )}

                                {message.attachments.length > 0 && !(message.error || message.waiting) && (
                                    <MessageAttachments
                                        message={message}
                                        functions={functions}
                                    />
                                )}

                                {message.attachments.length > 0 && (message.waiting || message.error) && (
                                    <div className={styles.imagesUpload}>
                                        <img
                                            src='/assets/app/file-blank.svg'
                                            alt='File Upload'
                                        />

                                        <div>
                                            <div>
                                                {message.error ? (
                                                    <div>Failed uploading files</div>
                                                ) : (
                                                    <>
                                                        <div>
                                                            {message.attachments.length === 1
                                                                ? message.attachments[0].file.name
                                                                : `${message.attachments.length} files`}
                                                        </div>

                                                        <div>
                                                            —{' '}
                                                            {(
                                                                message.attachments.reduce(
                                                                    (acc: number, attachment: any) =>
                                                                        acc + attachment.file.size,
                                                                    0
                                                                ) / 1000000
                                                            ).toFixed(2)}{' '}
                                                            MB
                                                        </div>
                                                    </>
                                                )}
                                            </div>

                                            <div>
                                                <div>
                                                    <div
                                                        style={{
                                                            transform: `translate3d(
                                                            ${fileProgress * 100 - 100}%,
                                                            0,
                                                            0
                                                        )`,
                                                            backgroundColor: message.error ? 'var(--error-1)' : '',
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div onClick={() => controller.abort()}>
                                            <Icon name='close' />
                                        </div>
                                    </div>
                                )}

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
            ),
        [message, edit, reply, editContent, fixedLayer, fileProgress]
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
                                functions={functions}
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
                                functions={functions}
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
                                    functions={functions}
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
                                            functions={functions}
                                        />
                                    ))}
                                </div>

                                <div>
                                    {message.attachments.slice(2, 3).map((attachment: TImageUpload) => (
                                        <Image
                                            key={attachment.id}
                                            attachment={attachment}
                                            message={message}
                                            functions={functions}
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
                                functions={functions}
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
                                    functions={functions}
                                />
                            ))}
                        </div>

                        <div className={styles.gridThree}>
                            {message.attachments.slice(2, 5).map((attachment: TImageUpload) => (
                                <Image
                                    key={attachment.id}
                                    attachment={attachment}
                                    message={message}
                                    functions={functions}
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
                                functions={functions}
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
                                    functions={functions}
                                />
                            ))}
                        </div>

                        <div className={styles.gridThree}>
                            {message.attachments.slice(1, 7).map((attachment: TImageUpload) => (
                                <Image
                                    key={attachment.id}
                                    attachment={attachment}
                                    message={message}
                                    functions={functions}
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
                                    functions={functions}
                                />
                            ))}
                        </div>

                        <div className={styles.gridThree}>
                            {message.attachments.slice(2, 8).map((attachment: TImageUpload) => (
                                <Image
                                    key={attachment.id}
                                    attachment={attachment}
                                    message={message}
                                    functions={functions}
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
                                functions={functions}
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
                                    functions={functions}
                                />
                            ))}
                        </div>

                        <div className={styles.gridThree}>
                            {message.attachments.slice(1, 10).map((attachment: TImageUpload) => (
                                <Image
                                    key={attachment.id}
                                    attachment={attachment}
                                    message={message}
                                    functions={functions}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

type MenuProps = {
    message: TMessage;
    large: boolean;
    functions: any;
};

const MessageMenu = ({ message, large, functions }: MenuProps) => {
    const [menuSender, setMenuSender] = useState<boolean | null>(null);
    const [shift, setShift] = useState<boolean>(false);

    const { setFixedLayer, fixedLayer }: any = useContextHook({ context: 'layer' });
    const { setTooltip }: any = useContextHook({ context: 'tooltip' });
    const { auth }: any = useContextHook({ context: 'auth' });

    useEffect(() => {
        if (message.author.id === auth.user.id) setMenuSender(true);
        else setMenuSender(false);
    }, [message]);

    useEffect(() => {
        const handleShift = (e: KeyboardEvent) => {
            if (e.key === 'Shift') setShift(true);
        };

        const handleShiftUp = (e: KeyboardEvent) => {
            if (e.key === 'Shift') setShift(false);
        };

        document.addEventListener('keydown', handleShift);
        document.addEventListener('keyup', handleShiftUp);

        return () => {
            document.removeEventListener('keydown', handleShift);
            document.removeEventListener('keyup', handleShiftUp);
        };
    }, []);

    if (message.waiting || typeof menuSender !== 'boolean') return null;

    return (
        <div
            className={styles.buttonContainer}
            style={{
                visibility: fixedLayer?.message?.id === message?.id ? 'visible' : undefined,
            }}
        >
            <div
                className={styles.buttonWrapper}
                style={{ top: large ? '-16px' : '-25px' }}
            >
                <div className={styles.buttons}>
                    {!message.error ? (
                        <>
                            <div
                                role='button'
                                onMouseEnter={(e) =>
                                    setTooltip({
                                        text: 'Add Reaction',
                                        element: e.currentTarget,
                                        gap: 3,
                                    })
                                }
                                onMouseLeave={() => setTooltip(null)}
                            >
                                <Icon name='addReaction' />
                            </div>

                            {menuSender ? (
                                <div
                                    role='button'
                                    onMouseEnter={(e) =>
                                        setTooltip({
                                            text: 'Edit',
                                            element: e.currentTarget,
                                            gap: 3,
                                        })
                                    }
                                    onMouseLeave={() => setTooltip(null)}
                                    onClick={() => {
                                        setTooltip(null);
                                        functions.editMessageState();
                                    }}
                                >
                                    <Icon name='edit' />
                                </div>
                            ) : (
                                <div
                                    role='button'
                                    onMouseEnter={(e) =>
                                        setTooltip({
                                            text: 'Reply',
                                            element: e.currentTarget,
                                            gap: 3,
                                        })
                                    }
                                    onMouseLeave={() => setTooltip(null)}
                                    onClick={() => {
                                        setTooltip(null);
                                        functions.replyToMessageState();
                                    }}
                                >
                                    <Icon name='reply' />
                                </div>
                            )}

                            <div
                                role='button'
                                onMouseEnter={(e) =>
                                    setTooltip({
                                        text: 'More',
                                        element: e.currentTarget,
                                        gap: 3,
                                    })
                                }
                                onMouseLeave={() => setTooltip(null)}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (fixedLayer?.element === e.currentTarget) {
                                        setFixedLayer(null);
                                    } else {
                                        setFixedLayer({
                                            type: 'menu',
                                            menu: 'MESSAGE',
                                            firstSide: 'LEFT',
                                            element: e.currentTarget,
                                            gap: 5,
                                            message: message,
                                            functions: functions,
                                        });
                                        setTooltip(null);
                                    }
                                }}
                            >
                                <Icon name='dots' />
                            </div>
                        </>
                    ) : message.waiting ? (
                        <></>
                    ) : (
                        <>
                            <div
                                role='button'
                                onMouseEnter={(e) =>
                                    setTooltip({
                                        text: 'Retry',
                                        element: e.currentTarget,
                                        gap: 3,
                                    })
                                }
                                onMouseLeave={() => setTooltip(null)}
                                onClick={() => {
                                    setTooltip(null);
                                    functions.retrySendMessage(message);
                                }}
                            >
                                <Icon name='retry' />
                            </div>

                            <div
                                role='button'
                                onMouseEnter={(e) =>
                                    setTooltip({
                                        text: 'Delete',
                                        element: e.currentTarget,
                                        gap: 3,
                                    })
                                }
                                onMouseLeave={() => setTooltip(null)}
                                onClick={() => {
                                    setTooltip(null);
                                    functions.deleteLocalMessage();
                                }}
                            >
                                <Icon name='delete' />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

type ImageComponent = {
    attachment: TImageUpload;
    message: TMessage;
    functions: any;
};

const Image = ({ attachment, message, functions }: ImageComponent) => {
    const [hideSpoiler, setHideSpoiler] = useState<boolean>(false);
    const [showDelete, setShowDelete] = useState<boolean>(false);

    const { setPopup, setFixedLayer }: any = useContextHook({ context: 'layer' });
    const { setTooltip }: any = useContextHook({ context: 'tooltip' });
    const { auth }: any = useContextHook({ context: 'auth' });

    return useMemo(
        () => (
            <div
                className={styles.image}
                onMouseEnter={() => {
                    if (auth.user.id !== message.author.id) return;
                    setShowDelete(true);
                }}
                onMouseLeave={() => {
                    if (auth.user.id !== message.author.id) return;
                    setShowDelete(false);
                }}
                onClick={() => {
                    if (attachment.isSpoiler && !hideSpoiler) {
                        setHideSpoiler(true);
                        return;
                    }

                    const index = message.attachments.findIndex((a) => a.id === attachment.id);

                    setPopup({
                        type: 'ATTACHMENT_PREVIEW',
                        attachments: message.attachments,
                        current: index,
                    });
                }}
                onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setFixedLayer({
                        type: 'menu',
                        menu: 'MESSAGE',
                        event: {
                            mouseX: e.clientX,
                            mouseY: e.clientY,
                        },
                        gap: 5,
                        message: message,
                        attachment: attachment,
                        functions: functions,
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

                {showDelete && (!attachment.isSpoiler || hideSpoiler) && (
                    <div
                        className={styles.deleteImage}
                        onMouseEnter={(e) =>
                            setTooltip({
                                text: 'Delete',
                                element: e.currentTarget,
                                gap: 2,
                            })
                        }
                        onMouseLeave={() => setTooltip(null)}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (auth.user.id !== message.author.id) return;

                            if (message.attachments.length === 1 && !message.content) {
                                setPopup({
                                    type: 'DELETE_MESSAGE',
                                    channelId: message.channelId[0],
                                    message: message,
                                });
                                return;
                            }

                            const updatedAttachments = message.attachments
                                .map((file) => file.id)
                                .filter((id: string) => id !== attachment.id);

                            setPopup({
                                type: 'DELETE_ATTACHMENT',
                                message: message,
                                attachments: updatedAttachments,
                            });
                        }}
                    >
                        <Icon
                            name='delete'
                            size={20}
                        />
                    </div>
                )}

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
        [attachment, showDelete, hideSpoiler]
    );
};

export default Message;
