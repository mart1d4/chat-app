'use client';

import { Tooltip, TextArea, Icon } from '@/app/app-components';
import { useEffect, useRef, useState } from 'react';
import styles from './Message.module.css';
import Image from 'next/image';
import useContextHook from '@/hooks/useContextHook';

const Message = ({
    params,
    message,
    setMessages,
    start,
    edit,
    setEdit,
    reply,
    setReply,
    noInt,
}: any) => {
    const [showTooltip, setShowTooltip] = useState<number | boolean>(false);
    const [hover, setHover] = useState<boolean>(false);
    const [shift, setShift] = useState<boolean>(false);
    const [editedMessage, setEditedMessage] = useState<string>(edit?.content ?? message.content);

    let noInteraction = noInt || false;

    const { menu, fixedLayer, setFixedLayer, setPopup }: any = useContextHook({ context: 'layer' });
    const { auth }: any = useContextHook({ context: 'auth' });
    const userImageRef = useRef(null);
    const userImageReplyRef = useRef(null);

    useEffect(() => {
        if (!editedMessage) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setEdit(null);
                localStorage.setItem(
                    `channel-${params.channelId}`,
                    JSON.stringify({
                        ...JSON.parse(localStorage.getItem(`channel-${params.channelId}`) || '{}'),
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
            if (e.key === 'Shift') {
                setShift(true);
            }
        };

        const handleShiftUp = (e: KeyboardEvent) => {
            if (e.key === 'Shift') {
                setShift(false);
            }
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
            console.log(error);
        }
    };

    const olderThan2Days = (date: Date) => {};

    const sendEditedMessage = async () => {
        if (
            editedMessage.length === 0 ||
            editedMessage.length > 4000 ||
            editedMessage === message.content
        ) {
            setEdit(null);

            localStorage.setItem(
                `channel-${params.channelId}`,
                JSON.stringify({
                    ...JSON.parse(localStorage.getItem(`channel-${params.channelId}`) || '{}'),
                    edit: null,
                })
            );

            return;
        }

        try {
            await fetch(`/api/users/me/channels/${params.channelId}/messages/${message.id}`, {
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
                `channel-${params.channelId}`,
                JSON.stringify({
                    ...JSON.parse(localStorage.getItem(`channel-${params.channelId}`) || '{}'),
                    edit: null,
                })
            );
        } catch (error) {
            console.log(error);
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
                                onMouseEnter={() => setShowTooltip(0)}
                                onMouseLeave={() => setShowTooltip(false)}
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

                                    <Tooltip
                                        show={showTooltip === 0}
                                        dist={3}
                                        delay={1}
                                    >
                                        {new Intl.DateTimeFormat('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: 'numeric',
                                            minute: 'numeric',
                                            second: 'numeric',
                                        }).format(new Date(message.createdAt))}
                                    </Tooltip>
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
                            <Image
                                src={`/assets/avatars/${message.messageReference.author.avatar}.png`}
                                alt='Avatar'
                                width={16}
                                height={16}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (fixedLayer?.element === userImageReplyRef.current) {
                                        setFixedLayer(null);
                                    } else {
                                        setFixedLayer({
                                            type: 'usercard',
                                            event: e,
                                            user: message.messageReference?.author,
                                            element: userImageReplyRef.current,
                                            firstSide: 'right',
                                            gap: 10,
                                        });
                                    }
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
                            />

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
                        <Image
                            ref={userImageRef}
                            src={`/assets/avatars/${message.author.avatar}.png`}
                            alt='Avatar'
                            width={40}
                            height={40}
                            onClick={(e) => {
                                if (fixedLayer?.element === userImageRef.current) {
                                    setFixedLayer(null);
                                } else {
                                    setFixedLayer({
                                        type: 'usercard',
                                        event: e,
                                        user: message?.author,
                                        element: userImageRef.current,
                                        firstSide: 'right',
                                        gap: 10,
                                    });
                                }
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
                        />
                        <h3>
                            <span className={styles.titleUsername}>{message.author?.username}</span>
                            <span
                                className={styles.titleTimestamp}
                                onMouseEnter={() => setShowTooltip(1)}
                                onMouseLeave={() => setShowTooltip(false)}
                            >
                                {new Intl.DateTimeFormat('en-US', {
                                    month: 'numeric',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: 'numeric',
                                    minute: 'numeric',
                                }).format(new Date(message.createdAt))}
                                <Tooltip
                                    show={showTooltip === 1}
                                    delay={1}
                                >
                                    {new Intl.DateTimeFormat('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: 'numeric',
                                        minute: 'numeric',
                                        second: 'numeric',
                                    }).format(new Date(message.createdAt))}
                                </Tooltip>
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
                                                `channel-${params.channelId}`,
                                                JSON.stringify({
                                                    ...JSON.parse(
                                                        localStorage.getItem(
                                                            `channel-${params.channelId}`
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
                                            onMouseEnter={() => setShowTooltip(2)}
                                            onMouseLeave={() => setShowTooltip(false)}
                                        >
                                            (edited)
                                        </span>

                                        <Tooltip
                                            show={showTooltip === 2}
                                            delay={1}
                                        >
                                            {new Intl.DateTimeFormat('en-US', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: 'numeric',
                                                minute: 'numeric',
                                                second: 'numeric',
                                            }).format(new Date(message.createdAt))}
                                        </Tooltip>
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
                                <span
                                    className={styles.messageTimestamp}
                                    onMouseEnter={() => setShowTooltip(3)}
                                    onMouseLeave={() => setShowTooltip(false)}
                                >
                                    <span>
                                        {new Intl.DateTimeFormat('en-US', {
                                            hour: 'numeric',
                                            minute: 'numeric',
                                        }).format(new Date(message.createdAt))}
                                        <Tooltip
                                            show={showTooltip === 3}
                                            dist={3}
                                            delay={1}
                                        >
                                            {new Intl.DateTimeFormat('en-US', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: 'numeric',
                                                minute: 'numeric',
                                                second: 'numeric',
                                            }).format(new Date(message.createdAt))}
                                        </Tooltip>
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
                                                `channel-${params.channelId}`,
                                                JSON.stringify({
                                                    ...JSON.parse(
                                                        localStorage.getItem(
                                                            `channel-${params.channelId}`
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
                                            onMouseEnter={() => setShowTooltip(2)}
                                            onMouseLeave={() => setShowTooltip(false)}
                                        >
                                            (edited)
                                        </span>

                                        <Tooltip
                                            show={showTooltip === 2}
                                            delay={1}
                                        >
                                            {new Intl.DateTimeFormat('en-US', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: 'numeric',
                                                minute: 'numeric',
                                                second: 'numeric',
                                            }).format(new Date(message.updateddAt))}
                                        </Tooltip>
                                    </div>
                                )}
                                {message?.type === 'RECIPIENT_ADD' && (
                                    <span
                                        className={styles.contentTimestamp}
                                        onMouseEnter={() => setShowTooltip(3)}
                                        onMouseLeave={() => setShowTooltip(false)}
                                        style={{
                                            userSelect: 'text',
                                        }}
                                    >
                                        <span>
                                            {new Intl.DateTimeFormat('en-US', {
                                                month: 'numeric',
                                                day: 'numeric',
                                                year: 'numeric',
                                                hour: 'numeric',
                                                minute: 'numeric',
                                            }).format(new Date(message.createdAt))}
                                            <Tooltip
                                                show={showTooltip === 3}
                                                dist={3}
                                                delay={1}
                                            >
                                                {new Intl.DateTimeFormat('en-US', {
                                                    weekday: 'long',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: 'numeric',
                                                    minute: 'numeric',
                                                    second: 'numeric',
                                                }).format(new Date(message.createdAt))}
                                            </Tooltip>
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
    const [showTooltip, setShowTooltip] = useState<0 | 1 | 2 | 3>(0);
    const [menuSender, setMenuSender] = useState<boolean>(false);

    const { auth }: any = useContextHook({ context: 'auth' });
    const { setFixedLayer, fixedLayer }: any = useContextHook({ context: 'layer' });
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
                        onMouseEnter={() => setShowTooltip(1)}
                        onMouseLeave={() => setShowTooltip(0)}
                    >
                        <Tooltip
                            show={showTooltip === 1}
                            dist={5}
                        >
                            Add Reaction
                        </Tooltip>
                        <Icon name='addReaction' />
                    </div>

                    {menuSender ? (
                        <div
                            role='button'
                            onMouseEnter={() => setShowTooltip(2)}
                            onMouseLeave={() => setShowTooltip(0)}
                            onClick={() => functions.editMessage()}
                        >
                            <Tooltip
                                show={showTooltip === 2}
                                dist={5}
                            >
                                Edit
                            </Tooltip>
                            <Icon name='edit' />
                        </div>
                    ) : (
                        <div
                            role='button'
                            onMouseEnter={() => setShowTooltip(2)}
                            onMouseLeave={() => setShowTooltip(0)}
                            onClick={() => functions.replyToMessage()}
                        >
                            <Tooltip
                                show={showTooltip === 2}
                                dist={5}
                            >
                                Reply
                            </Tooltip>
                            <Icon name='reply' />
                        </div>
                    )}

                    <div
                        ref={menuButtonRef}
                        role='button'
                        onMouseEnter={() => setShowTooltip(3)}
                        onMouseLeave={() => setShowTooltip(0)}
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
                                setShowTooltip(0);
                            }
                        }}
                    >
                        <Tooltip
                            show={showTooltip === 3}
                            dist={5}
                        >
                            More
                        </Tooltip>
                        <Icon name='dots' />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Message;
