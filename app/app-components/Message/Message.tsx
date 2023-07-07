'use client';

import { TextArea, Icon, Avatar } from '@/app/app-components';
import { editMessage } from '@/lib/api-functions/messages';
import useContextHook from '@/hooks/useContextHook';
import { useEffect, useState } from 'react';
import { trimMessage } from '@/lib/strings';
import styles from './Message.module.css';

type MessageProps = {
    message: TMessage;
    large?: boolean;
    last?: boolean;
    edit?: MessageEditObject | null;
    setEdit?: React.Dispatch<React.SetStateAction<MessageEditObject | null>>;
    reply?: MessageReplyObject | null;
    setReply?: React.Dispatch<React.SetStateAction<MessageReplyObject | null>>;
};

const Message = ({ message, large, edit, setEdit, reply, setReply }: MessageProps) => {
    // States
    const [hover, setHover] = useState<boolean>(false);
    const [shift, setShift] = useState<boolean>(false);
    const [editContent, setEditContent] = useState<string>(message.content);

    // Hooks
    const { menu, fixedLayer, setFixedLayer, setPopup }: any = useContextHook({ context: 'layer' });
    const { setTooltip }: any = useContextHook({ context: 'tooltip' });
    const { auth }: any = useContextHook({ context: 'auth' });

    // Effects

    useEffect(() => {
        if (!setEdit || !setReply) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (edit) {
                    setEdit(null);
                    setLocalStorage({ edit: null });
                }

                if (reply) {
                    setReply(null);
                    setLocalStorage({ reply: null });
                }
            } else if (e.key === 'Enter' && e.shiftKey === false) {
                if (!edit || edit?.messageId !== message.id) return;
                sendEditedMessage();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [edit, editContent]);

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

    // Functions

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
            delete: {
                channelId: message.channelId[0],
            },
            message: message,
        });
    };

    const pinPopup = () => {
        setPopup({
            pin: {
                channelId: message.channelId[0],
            },
            message: message,
        });
    };

    const unpinPopup = () => {
        setPopup({
            unpin: {
                channelId: message.channelId[0],
            },
            message: message,
        });
    };

    const editMessageState = async () => {
        if (!setEdit) return;

        setEdit({
            messageId: message.id,
            content: message.content,
        });

        setLocalStorage({
            edit: {
                messageId: message.id,
                content: message.content,
            },
        });
    };

    const sendEditedMessage = async () => {
        if (!setEdit) return;
        const content = trimMessage(editContent);

        if (content.length === 0 || content.length > 4000 || content === message.content) {
            setEdit(null);
            setLocalStorage({ edit: null });
            return;
        }

        try {
            await editMessage(auth.accessToken, message, content);

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
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                onContextMenu={(e) => {
                    e.preventDefault();
                    setFixedLayer({
                        type: 'menu',
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
                }}
            >
                {(hover || fixedLayer?.message?.id === message?.id) && (
                    <MessageMenu
                        message={message}
                        large={large}
                        functions={{
                            deletePopup,
                            replyToMessageState,
                        }}
                    />
                )}

                <div className={styles.message}>
                    <div className={styles.specialIcon}>
                        <div
                            style={{
                                backgroundImage: `url(/assets/join.svg)`,
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
                            {message.content + ' '}

                            <span
                                className={styles.contentTimestamp}
                                onMouseEnter={(e) =>
                                    setTooltip({
                                        text: getLongDate(message.createdAt),
                                        element: e.currentTarget,
                                        delay: 1000,
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

    return (
        <li
            className={
                styles.messageContainer +
                ' ' +
                (large || message.type === 'REPLY' ? styles.large : '') +
                ' ' +
                (reply?.messageId === message.id ? styles.reply : '')
            }
            onMouseEnter={() => {
                setHover(true);
            }}
            onMouseLeave={() => setHover(false)}
            onContextMenu={(e) => {
                e.preventDefault();
                if (edit?.messageId === message.id) return;
                setFixedLayer({
                    type: 'menu',
                    event: {
                        mouseX: e.clientX,
                        mouseY: e.clientY,
                    },
                    message: message,
                    deletePopup,
                    pinPopup,
                    unpinPopup,
                    editMessageState,
                    replyToMessageState,
                });
            }}
            style={{
                backgroundColor:
                    (fixedLayer?.message?.id === message?.id || edit?.messageId === message.id) &&
                    reply?.messageId !== message.id
                        ? 'var(--background-hover-4)'
                        : '',
            }}
        >
            {(hover || fixedLayer?.message?.id === message?.id) && edit?.messageId !== message.id && (
                <MessageMenu
                    message={message}
                    large={large}
                    functions={{
                        deletePopup,
                        pinPopup,
                        unpinPopup,
                        editMessageState,
                        replyToMessageState,
                    }}
                />
            )}

            {large || message.type === 'REPLY' ? (
                <div className={styles.messagelarge}>
                    {message.type === 'REPLY' && (
                        <div className={styles.messageReply}>
                            <div
                                className={styles.userAvatarReply}
                                onDoubleClick={(e) => e.stopPropagation()}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (fixedLayer?.e?.currentTarget === e.currentTarget) {
                                        setFixedLayer(null);
                                    } else {
                                        setFixedLayer({
                                            type: 'usercard',
                                            event: {
                                                mouseX: e.clientX,
                                                mouseY: e.clientY,
                                            },
                                            // @ts-ignore
                                            user: message.messageReference?.author,
                                            element: e.currentTarget,
                                            firstSide: 'right',
                                            gap: 10,
                                        });
                                    }
                                }}
                                onContextMenu={(e) => {
                                    e.stopPropagation();
                                    setFixedLayer({
                                        type: 'menu',
                                        event: {
                                            mouseX: e.clientX,
                                            mouseY: e.clientY,
                                        },
                                        //  @ts-ignore
                                        user: message.messageReference?.author,
                                    });
                                }}
                            >
                                <Avatar
                                    // @ts-ignore
                                    src={message.messageReference?.author?.avatar}
                                    // @ts-ignore
                                    alt={message.messageReference?.author?.username}
                                    size={16}
                                />
                            </div>

                            <span
                                onDoubleClick={(e) => e.stopPropagation()}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (fixedLayer?.e?.currentTarget === e.currentTarget) {
                                        setFixedLayer(null);
                                    } else {
                                        setFixedLayer({
                                            type: 'usercard',
                                            // @ts-ignore
                                            user: message.messageReference?.author,
                                            element: e.currentTarget,
                                            firstSide: 'right',
                                            gap: 10,
                                        });
                                    }
                                }}
                                onContextMenu={(e) => {
                                    e.stopPropagation();
                                    setFixedLayer({
                                        type: 'menu',
                                        event: {
                                            mouseX: e.clientX,
                                            mouseY: e.clientY,
                                        },
                                        //  @ts-ignore
                                        user: message.messageReference?.author,
                                    });
                                }}
                            >
                                {message.messageReference?.author?.username}
                            </span>

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
                                    firstSide: 'right',
                                    gap: 10,
                                });
                            }}
                            onDoubleClick={(e) => e.stopPropagation()}
                            onContextMenu={(e) => {
                                e.stopPropagation();
                                setFixedLayer({
                                    type: 'menu',
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

                        <h3>
                            <span
                                className={styles.titleUsername}
                                onDoubleClick={(e) => e.stopPropagation()}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (fixedLayer?.e?.currentTarget === e.currentTarget) {
                                        setFixedLayer(null);
                                    } else {
                                        setFixedLayer({
                                            type: 'usercard',
                                            user: message.author,
                                            element: e.currentTarget,
                                            firstSide: 'right',
                                            gap: 10,
                                        });
                                    }
                                }}
                                onContextMenu={(e) => {
                                    e.stopPropagation();
                                    setFixedLayer({
                                        type: 'menu',
                                        event: {
                                            mouseX: e.clientX,
                                            mouseY: e.clientY,
                                        },
                                        user: message.author,
                                    });
                                }}
                            >
                                {message.author?.username}
                            </span>
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
                        )}
                    </div>
                </div>
            ) : (
                <div className={styles.message}>
                    <div
                        className={styles.messageContent}
                        onDoubleClick={() => {
                            if (message.author?.id === auth?.user?.id) editMessageState();
                            else replyToMessageState();
                        }}
                    >
                        {(hover || menu?.message === message?.id) && (
                            <span className={styles.messageTimestamp}>
                                <span
                                    onMouseEnter={(e) =>
                                        setTooltip({
                                            text: getLongDate(message.createdAt),
                                            element: e.currentTarget,
                                            gap: 2,
                                            delay: 1000,
                                        })
                                    }
                                    onMouseLeave={() => setTooltip(null)}
                                >
                                    {getShortDate(message.createdAt)}
                                </span>
                            </span>
                        )}

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
                        )}
                    </div>
                </div>
            )}
        </li>
    );
};

const MessageMenu = ({ message, large, functions }: any) => {
    const [menuSender, setMenuSender] = useState<boolean>(false);

    const { setFixedLayer, fixedLayer }: any = useContextHook({ context: 'layer' });
    const { setTooltip }: any = useContextHook({ context: 'tooltip' });
    const { auth }: any = useContextHook({ context: 'auth' });

    useEffect(() => {
        if (message.author.id === auth.user.id) setMenuSender(true);
        else setMenuSender(false);
    }, [message]);

    return (
        <div className={styles.buttonContainer}>
            <div
                className={styles.buttonWrapper}
                style={{ top: large ? '-16px' : '-25px' }}
            >
                <div className={styles.buttons}>
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
                            onClick={() => functions.editMessageState()}
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
                            onClick={() => functions.replyToMessageState()}
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
                                    firstSide: 'left',
                                    element: e.currentTarget,
                                    gap: 5,
                                    message: message,
                                    deletePopup: functions.deletePopup,
                                    pinPopup: functions.pinPopup,
                                    unpinPopup: functions.unpinPopup,
                                    editMessageState: functions.editMessageState,
                                    replyToMessageState: functions.replyToMessageState,
                                });
                                setTooltip(null);
                            }
                        }}
                    >
                        <Icon name='dots' />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Message;
