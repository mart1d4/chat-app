'use client';

import { TextArea, Icon, Avatar } from '@/app/app-components';
import { useEffect, useRef, useState } from 'react';
import useContextHook from '@/hooks/useContextHook';
import styles from './Message.module.css';
import Image from 'next/image';

const Message = ({ params, message, start, edit, setEdit, reply, noInt }: any) => {
    const [hover, setHover] = useState<boolean>(false);
    const [shift, setShift] = useState<boolean>(false);
    const [editedMessage, setEditedMessage] = useState<string>(edit?.content ?? message.content);

    let noInteraction = noInt || false;

    const { menu, fixedLayer, setFixedLayer, setPopup }: any = useContextHook({ context: 'layer' });
    const { setTooltip }: any = useContextHook({ context: 'tooltip' });
    const { auth }: any = useContextHook({ context: 'auth' });
    const userImageReplyRef = useRef(null);
    const userImageRef = useRef(null);

    // useEffect(() => {
    //     const notifications = auth.user.notifications.map((notification: any) => {
    //         if (notification.channel === message.channelId[0]) {
    //             return { ...notification, count: 0 };
    //         }

    //         return notification;
    //     });

    //     setAuth({
    //         ...auth,
    //         user: {
    //             ...auth.user,
    //             notifications,
    //         },
    //     });
    // }, []);

    useEffect(() => {
        if (!editedMessage) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setEdit(null);
                localStorage.setItem(
                    `channel-${message.channel[0].id}`,
                    JSON.stringify({
                        ...JSON.parse(
                            localStorage.getItem(`channel-${message.channel[0].id}`) || ''
                        ),
                        edit: null,
                    })
                );
            } else if (e.key === 'Enter' && e.shiftKey === false) {
                if (!edit || edit?.messageId !== message.id) return;
                sendEditedMessage();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [editedMessage]);

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

    const deleteMessage = async () => {
        try {
            await fetch(`/api/users/me/channels/${message.channelId[0]}/messages/${message.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${auth.accessToken}`,
                },
            });
        } catch (error) {
            console.error(error);
        }
    };

    const sendEditedMessage = async () => {
        if (
            editedMessage.length === 0 ||
            editedMessage.length > 4000 ||
            editedMessage === message.content
        ) {
            setEdit(null);

            localStorage.setItem(
                `channel-${message.channel[0].id}`,
                JSON.stringify({
                    ...JSON.parse(localStorage.getItem(`channel-${message.channel[0].id}`) || ''),
                    edit: null,
                })
            );

            return;
        }

        try {
            await fetch(`/api/users/me/channels/${message.channelId[0]}/messages/${message.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${auth.accessToken}`,
                },
                body: JSON.stringify({
                    content: editedMessage,
                }),
            });

            setEdit(null);
            localStorage.setItem(
                `channel-${message.channel[0].id}`,
                JSON.stringify({
                    ...JSON.parse(localStorage.getItem(`channel-${message.channel[0].id}`) || ''),
                    edit: null,
                })
            );
        } catch (error) {
            console.error(error);
        }
    };

    const deletePopup = () => {
        setPopup({
            delete: {
                channelId: message.channel,
                message: message,
                func: () => deleteMessage(),
            },
        });
    };

    const editMessage = async () => {
        setEdit({
            messageId: message.id,
            content: message.content,
        });

        localStorage.setItem(
            `channel-${message.channel}`,
            JSON.stringify({
                ...JSON.parse(localStorage.getItem(`channel-${message?.channel}`) || '{}'),
                edit: {
                    messageId: message.id,
                    content: message.content,
                },
            })
        );
    };

    const pinPopup = async () => {
        setPopup({
            pin: {
                channelId: message.channel,
                message: message,
                // func: () => pinMessage(),
            },
        });
    };

    const unpinPopup = async () => {
        setPopup({
            unpin: {
                channelId: message.channel,
                message: message,
                // func: () => unpinMessage(),
            },
        });
    };

    if (message.type === 'RECIPIENT_ADD') {
        return (
            <div
                className={styles.li + ' ' + styles.noInt}
                onMouseEnter={() => {
                    if (noInteraction) return;
                    setHover(true);
                }}
                onMouseLeave={() => setHover(false)}
                onContextMenu={(e) => {
                    e.preventDefault();
                    if (noInteraction) return;
                    setFixedLayer({
                        type: 'menu',
                        event: e,
                        message: message,
                        deletePopup,
                        deleteMessage,
                        pinPopup,
                        // pinMessage,
                        unpinPopup,
                        // unpinMessage,
                        editMessage,
                        // replyToMessage,
                    });
                }}
                style={
                    hover || fixedLayer?.message?.id === message?.id
                        ? { backgroundColor: 'var(--background-hover-4)' }
                        : {}
                }
            >
                {(hover || fixedLayer?.message?.id === message?.id) && (
                    <MessageMenu
                        message={message}
                        start={start}
                        functions={{
                            deletePopup,
                            deleteMessage,
                            pinPopup,
                            // pinMessage,
                            unpinPopup,
                            // unpinMessage,
                            editMessage,
                            // replyToMessage,
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
                                        text: new Intl.DateTimeFormat('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: 'numeric',
                                            minute: 'numeric',
                                            second: 'numeric',
                                        }).format(new Date(message.createdAt)),
                                        element: e.currentTarget,
                                        delay: 1000,
                                    })
                                }
                                onMouseLeave={() => setTooltip(null)}
                            >
                                <span style={{ userSelect: 'text' }}>
                                    {new Intl.DateTimeFormat('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: 'numeric',
                                        minute: 'numeric',
                                        second: 'numeric',
                                    }).format(new Date(message.createdAt))}
                                </span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className={
                reply?.id === message.id
                    ? styles.liReply + ' ' + styles.noInt
                    : styles.li + ' ' + styles.noInt
            }
            onMouseEnter={() => {
                if (noInteraction) return;
                setHover(true);
            }}
            onMouseLeave={() => setHover(false)}
            onContextMenu={(e) => {
                e.preventDefault();
                if (noInteraction || edit?.messageId === message.id) return;
                setFixedLayer({
                    type: 'menu',
                    event: e,
                    message: message,
                    deletePopup,
                    deleteMessage,
                    pinPopup,
                    // pinMessage,
                    unpinPopup,
                    // unpinMessage,
                    editMessage,
                    // replyToMessage,
                });
            }}
            style={
                hover || fixedLayer?.message?.id === message?.id || edit?.messageId === message.id
                    ? {
                          backgroundColor:
                              reply?.id === message.id ? '' : 'var(--background-hover-4)',
                      }
                    : {}
            }
        >
            {(hover || fixedLayer?.message?.id === message?.id) &&
                edit?.messageId !== message.id && (
                    <MessageMenu
                        message={message}
                        start={start}
                        functions={{
                            deletePopup,
                            deleteMessage,
                            pinPopup,
                            // pinMessage,
                            unpinPopup,
                            // unpinMessage,
                            editMessage,
                            // replyToMessage,
                        }}
                    />
                )}

            {start || message.type === 'REPLY' || noInteraction ? (
                <div className={styles.messageStart}>
                    {message.type === 'REPLY' && (
                        <div className={styles.messageReply}>
                            <div
                                className={styles.userAvatar}
                                onClick={(e) => {
                                    if (fixedLayer?.element === userImageReplyRef.current) {
                                        setFixedLayer(null);
                                        return;
                                    }

                                    setFixedLayer({
                                        type: 'usercard',
                                        event: e,
                                        user: message.messageReference?.author,
                                        element: userImageReplyRef.current,
                                        firstSide: 'right',
                                        gap: 10,
                                    });
                                }}
                                onContextMenu={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setFixedLayer({
                                        type: 'menu',
                                        event: e,
                                        user: message.messageReference?.author,
                                    });
                                }}
                            >
                                <Avatar
                                    src={message.author.avatar}
                                    alt={message.author.username}
                                    size={16}
                                />
                            </div>

                            <span>{message.messageReference?.author?.username}</span>

                            <div>{message.messageReference?.content}</div>
                        </div>
                    )}

                    <div
                        className={styles.messageContent}
                        onDoubleClick={() => {
                            if (noInteraction || edit?.messageId === message.id) return;
                            if (message.author.id === auth?.user?.id) {
                                editMessage();
                            } else {
                                // replyToMessage();
                            }
                        }}
                    >
                        <div
                            ref={userImageRef}
                            className={styles.userAvatar}
                            onClick={(e) => {
                                if (fixedLayer?.element === userImageRef.current) {
                                    setFixedLayer(null);
                                    return;
                                }

                                setFixedLayer({
                                    type: 'usercard',
                                    event: e,
                                    user: message?.author,
                                    element: userImageRef.current,
                                    firstSide: 'right',
                                    gap: 10,
                                });
                            }}
                            onDoubleClick={(e) => e.stopPropagation()}
                            onContextMenu={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                setFixedLayer({
                                    type: 'menu',
                                    event: e,
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
                            <span className={styles.titleUsername}>{message.author?.username}</span>
                            <span
                                className={styles.titleTimestamp}
                                onMouseEnter={(e) =>
                                    setTooltip({
                                        text: new Intl.DateTimeFormat('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: 'numeric',
                                            minute: 'numeric',
                                            second: 'numeric',
                                        }).format(new Date(message.createdAt)),
                                        element: e.currentTarget,
                                        delay: 1000,
                                    })
                                }
                                onMouseLeave={() => setTooltip(null)}
                            >
                                {new Intl.DateTimeFormat('en-US', {
                                    month: 'numeric',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: 'numeric',
                                    minute: 'numeric',
                                }).format(new Date(message.createdAt))}
                            </span>
                        </h3>
                        {edit?.messageId === message.id ? (
                            <>
                                <TextArea
                                    editedMessage={editedMessage || ' '}
                                    setEditedMessage={setEditedMessage}
                                />
                                <div className={styles.editHint}>
                                    escape to{' '}
                                    <span
                                        onClick={() => {
                                            setEdit(null);
                                            localStorage.setItem(
                                                `channel-${message.channel[0].id}`,
                                                JSON.stringify({
                                                    ...JSON.parse(
                                                        localStorage.getItem(
                                                            `channel-${message.channel[0].id}`
                                                        ) || '{}'
                                                    ),
                                                    edit: null,
                                                })
                                            );
                                        }}
                                    >
                                        cancel{' '}
                                    </span>
                                    • enter to{' '}
                                    <span onClick={() => sendEditedMessage()}>save </span>
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
                                                    text: new Intl.DateTimeFormat('en-US', {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        hour: 'numeric',
                                                        minute: 'numeric',
                                                        second: 'numeric',
                                                    }).format(new Date(message.createdAt)),
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
                            if (message?.type === 'RECIPIENT_ADD') return;
                            if (message.author?.id === auth?.user?.id) editMessage();
                            // else replyToMessage();
                        }}
                    >
                        {(hover || menu?.message === message?.id) &&
                            message?.type !== 'RECIPIENT_ADD' && (
                                <span className={styles.messageTimestamp}>
                                    <span
                                        onMouseEnter={(e) =>
                                            setTooltip({
                                                text: new Intl.DateTimeFormat('en-US', {
                                                    weekday: 'long',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: 'numeric',
                                                    minute: 'numeric',
                                                    second: 'numeric',
                                                }).format(new Date(message.createdAt)),
                                                element: e.currentTarget,
                                                gap: 2,
                                                delay: 1000,
                                            })
                                        }
                                        onMouseLeave={() => setTooltip(null)}
                                    >
                                        {new Intl.DateTimeFormat('en-US', {
                                            hour: 'numeric',
                                            minute: 'numeric',
                                        }).format(new Date(message.createdAt))}
                                    </span>
                                </span>
                            )}
                        {edit?.messageId === message.id ? (
                            <>
                                <TextArea
                                    editedMessage={editedMessage || message.content}
                                    setEditedMessage={setEditedMessage}
                                />
                                <div className={styles.editHint}>
                                    escape to{' '}
                                    <span
                                        onClick={() => {
                                            setEdit(null);
                                            localStorage.setItem(
                                                `channel-${message.channel[0].id}`,
                                                JSON.stringify({
                                                    ...JSON.parse(
                                                        localStorage.getItem(
                                                            `channel-${message.channel[0].id}`
                                                        ) || '{}'
                                                    ),
                                                    edit: null,
                                                })
                                            );
                                        }}
                                    >
                                        cancel{' '}
                                    </span>
                                    • enter to{' '}
                                    <span onClick={() => sendEditedMessage()}>save </span>
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
                                                    text: new Intl.DateTimeFormat('en-US', {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        hour: 'numeric',
                                                        minute: 'numeric',
                                                        second: 'numeric',
                                                    }).format(new Date(message.updateddAt)),
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
                                {message?.type === 'RECIPIENT_ADD' && (
                                    <span
                                        className={styles.contentTimestamp}
                                        style={{ userSelect: 'text' }}
                                    >
                                        <span
                                            onMouseEnter={(e) =>
                                                setTooltip({
                                                    text: new Intl.DateTimeFormat('en-US', {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        hour: 'numeric',
                                                        minute: 'numeric',
                                                        second: 'numeric',
                                                    }).format(new Date(message.createdAt)),
                                                    element: e.currentTarget,
                                                    gap: 2,
                                                    delay: 1000,
                                                })
                                            }
                                            onMouseLeave={() => setTooltip(null)}
                                        >
                                            {new Intl.DateTimeFormat('en-US', {
                                                month: 'numeric',
                                                day: 'numeric',
                                                year: 'numeric',
                                                hour: 'numeric',
                                                minute: 'numeric',
                                            }).format(new Date(message.createdAt))}
                                        </span>
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const MessageMenu = ({ message, start, functions }: any) => {
    const [menuSender, setMenuSender] = useState<boolean>(false);

    const { setFixedLayer, fixedLayer }: any = useContextHook({ context: 'layer' });
    const { setTooltip }: any = useContextHook({ context: 'tooltip' });
    const { auth }: any = useContextHook({ context: 'auth' });
    const menuButtonRef = useRef(null);

    useEffect(() => {
        if (message.author.id === auth.user.id) setMenuSender(true);
        else setMenuSender(false);
    }, [message]);

    return (
        <div className={styles.buttonContainer}>
            <div
                className={styles.buttonWrapper}
                style={{ top: start ? '-16px' : '-25px' }}
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
                            onClick={() => functions.editMessage()}
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
                            onClick={() => functions.replyToMessage()}
                        >
                            <Icon name='reply' />
                        </div>
                    )}

                    <div
                        ref={menuButtonRef}
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
                            if (fixedLayer?.element === menuButtonRef.current) {
                                setFixedLayer(null);
                            } else {
                                setFixedLayer({
                                    type: 'menu',
                                    event: e,
                                    firstSide: 'left',
                                    element: menuButtonRef.current,
                                    gap: 5,
                                    message: message,
                                    deletePopup: functions.deletePopup,
                                    deleteMessage: functions.deleteMessage,
                                    pinPopup: functions.pinPopup,
                                    pinMessage: functions.pinMessage,
                                    unpinPopup: functions.unpinPopup,
                                    unpinMessage: functions.unpinMessage,
                                    editMessage: functions.editMessage,
                                    replyToMessage: functions.replyToMessage,
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
