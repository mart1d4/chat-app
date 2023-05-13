'use client';

import { Tooltip, TextArea, Icon } from '@/app/app-components';
import useAxiosPrivate from '@/hooks/useAxiosPrivate';
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
    const [hover, setHover] = useState(false);
    const [shift, setShift] = useState(false);
    const [editedMessage, setEditedMessage] = useState(
        edit?.content || edit?.content === '' ? edit?.content : message.content
    );

    let noInteraction = noInt || false;

    const axiosPrivate = useAxiosPrivate();
    const { menu, fixedLayer, setFixedLayer, setPopup }: any = useContextHook({
        context: 'layer',
    });
    const { auth }: any = useContextHook({
        context: 'auth',
    });
    const userImageRef = useRef(null);
    const userImageReplyRef = useRef(null);

    useEffect(() => {
        if (!editedMessage) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setEdit(null);
                localStorage.setItem(
                    `channel-${params.channelID}`,
                    JSON.stringify({
                        ...JSON.parse(
                            localStorage.getItem(
                                `channel-${params.channelID}`
                            ) || '{}'
                        ),
                        edit: null,
                    })
                );
            } else if (e.key === 'Enter' && e.shiftKey === false) {
                if (!edit || edit?.messageID !== message._id) return;
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

    const olderThan2Days = (date: Date) => {};

    const sendEditedMessage = async () => {
        if (editedMessage.length === 0) {
            setEdit(null);
            localStorage.setItem(
                `channel-${params.channelID}`,
                JSON.stringify({
                    ...JSON.parse(
                        localStorage.getItem(`channel-${params.channelID}`) ||
                            '{}'
                    ),
                    edit: null,
                })
            );
            return;
        } else if (editedMessage.length > 4000) {
            setEdit(null);
            localStorage.setItem(
                `channel-${params.channelID}`,
                JSON.stringify({
                    ...JSON.parse(
                        localStorage.getItem(`channel-${params.channelID}`) ||
                            '{}'
                    ),
                    edit: null,
                })
            );
            return;
        } else if (editedMessage === message.content) {
            setEdit(null);
            localStorage.setItem(
                `channel-${params.channelID}`,
                JSON.stringify({
                    ...JSON.parse(
                        localStorage.getItem(`channel-${params.channelID}`) ||
                            '{}'
                    ),
                    edit: null,
                })
            );
            return;
        }

        const response = await axiosPrivate.patch(
            `/channels/${params.channelID}/messages/${message._id}`,
            {
                content: editedMessage,
            }
        );

        if (!response.data.success) {
            console.log(response.data.message);
        } else {
            setMessages((messages: any) => {
                return messages.map((message: any) => {
                    if (message._id === response.data.message._id) {
                        return response.data.message;
                    } else {
                        return message;
                    }
                });
            });
        }

        setEdit(null);
        localStorage.setItem(
            `channel-${params.channelID}`,
            JSON.stringify({
                ...JSON.parse(
                    localStorage.getItem(`channel-${params.channelID}`) || '{}'
                ),
                edit: null,
            })
        );
    };

    const deletePopup = () => {
        setPopup({
            delete: {
                channelID: message.channel,
                message: message,
                func: () => deleteMessage(),
            },
        });
    };

    const deleteMessage = async () => {
        const response = await axiosPrivate.delete(
            `/channels/${message.channel}/messages/${message._id}`
        );

        if (response.data.success) {
            setMessages((messages: any) => {
                return messages.filter(
                    (message: any) => message._id !== response.data.message._id
                );
            });
        }
    };

    const editMessage = async () => {
        setEdit({
            messageID: message._id,
            content: message.content,
        });

        localStorage.setItem(
            `channel-${message.channel}`,
            JSON.stringify({
                ...JSON.parse(
                    localStorage.getItem(`channel-${message?.channel}`) || '{}'
                ),
                edit: {
                    messageID: message._id,
                    content: message.content,
                },
            })
        );
    };

    const pinPopup = async () => {
        console.log(message.channel);
        setPopup({
            pin: {
                channelID: message.channel,
                message: message,
                func: () => pinMessage(),
            },
        });
    };

    const pinMessage = async () => {
        const response = await axiosPrivate.put(
            `/channels/${message.channel}/pins/${message._id}`
        );

        if (response.data.success) {
            setMessages((messages: any) => {
                return messages.map((message: any) => {
                    if (message._id === response.data.data._id) {
                        return response.data.data;
                    } else {
                        return message;
                    }
                });
            });
        }
    };

    const unpinPopup = async () => {
        setPopup({
            unpin: {
                channelID: message.channel,
                message: message,
                func: () => unpinMessage(),
            },
        });
    };

    const unpinMessage = async () => {
        const response = await axiosPrivate.delete(
            `/channels/${message.channel}/pins/${message._id}`
        );

        if (response.data.success) {
            setMessages((messages: any) => {
                return messages.map((message: any) => {
                    if (message._id === response.data.data._id) {
                        return response.data.data;
                    } else {
                        return message;
                    }
                });
            });
        }
    };

    const replyToMessage = async () => {
        setReply(message);

        localStorage.setItem(
            `channel-${message.channel}`,
            JSON.stringify({
                ...JSON.parse(
                    localStorage.getItem(`channel-${message?.channel}`) || '{}'
                ),
                reply: message,
            })
        );
    };

    if (message.type === 2) {
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
                        pinMessage,
                        unpinPopup,
                        unpinMessage,
                        editMessage,
                        replyToMessage,
                    });
                }}
                style={
                    hover || fixedLayer?.message?._id === message?._id
                        ? { backgroundColor: 'var(--background-hover-4)' }
                        : {}
                }
            >
                {(hover || fixedLayer?.message?._id === message?._id) && (
                    <MessageMenu
                        message={message}
                        start={start}
                        functions={{
                            deletePopup,
                            deleteMessage,
                            pinPopup,
                            pinMessage,
                            unpinPopup,
                            unpinMessage,
                            editMessage,
                            replyToMessage,
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
                reply?._id === message._id
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
                if (noInteraction || edit?.messageID === message._id) return;
                setFixedLayer({
                    type: 'menu',
                    event: e,
                    message: message,
                    deletePopup,
                    deleteMessage,
                    pinPopup,
                    pinMessage,
                    unpinPopup,
                    unpinMessage,
                    editMessage,
                    replyToMessage,
                });
            }}
            style={
                hover ||
                fixedLayer?.message?._id === message?._id ||
                edit?.messageID === message._id
                    ? {
                          backgroundColor:
                              reply?._id === message._id
                                  ? ''
                                  : 'var(--background-hover-4)',
                      }
                    : {}
            }
        >
            {(hover || fixedLayer?.message?._id === message?._id) &&
                edit?.messageID !== message._id && (
                    <MessageMenu
                        message={message}
                        start={start}
                        functions={{
                            deletePopup,
                            deleteMessage,
                            pinPopup,
                            pinMessage,
                            unpinPopup,
                            unpinMessage,
                            editMessage,
                            replyToMessage,
                        }}
                    />
                )}

            {start || message.type === 1 || noInteraction ? (
                <div className={styles.messageStart}>
                    {message.type === 1 && (
                        <div className={styles.messageReply}>
                            <Image
                                src={
                                    message.messageReference?.author?.avatar ||
                                    '/assets/default-avatars/blue.png'
                                }
                                alt='Avatar'
                                width={16}
                                height={16}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (
                                        fixedLayer?.element ===
                                        userImageReplyRef.current
                                    ) {
                                        setFixedLayer(null);
                                    } else {
                                        setFixedLayer({
                                            type: 'usercard',
                                            event: e,
                                            user: message.messageReference
                                                ?.author,
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

                            <span>
                                {message.messageReference?.author?.username}
                            </span>

                            <div>{message.messageReference?.content}</div>
                        </div>
                    )}

                    <div
                        className={styles.messageContent}
                        onDoubleClick={() => {
                            if (
                                noInteraction ||
                                edit?.messageID === message._id
                            )
                                return;
                            if (message.author._id === auth?.user?._id) {
                                editMessage();
                            } else {
                                replyToMessage();
                            }
                        }}
                    >
                        <Image
                            ref={userImageRef}
                            src={
                                message.author?.avatar ||
                                '/assets/default-avatars/blue.png'
                            }
                            alt='Avatar'
                            width={40}
                            height={40}
                            onClick={(e) => {
                                if (
                                    fixedLayer?.element === userImageRef.current
                                ) {
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
                            <span className={styles.titleUsername}>
                                {message.author?.username}
                            </span>
                            <span
                                className={styles.titleTimestamp}
                                onMouseEnter={() => setShowTooltip(1)}
                                onMouseLeave={() => setShowTooltip(false)}
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
                        {edit?.messageID === message._id ? (
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
                                                `channel-${params.channelID}`,
                                                JSON.stringify({
                                                    ...JSON.parse(
                                                        localStorage.getItem(
                                                            `channel-${params.channelID}`
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
                                    <span onClick={() => sendEditedMessage()}>
                                        save{' '}
                                    </span>
                                </div>
                            </>
                        ) : (
                            <div
                                style={{
                                    whiteSpace: 'pre-line',
                                    opacity: message.waiting ? 0.5 : 1,
                                    color: message.error
                                        ? 'var(--error-1)'
                                        : '',
                                }}
                            >
                                {message.content}{' '}
                                {message.edited && (
                                    <div className={styles.contentTimestamp}>
                                        <span
                                            onMouseEnter={() =>
                                                setShowTooltip(2)
                                            }
                                            onMouseLeave={() =>
                                                setShowTooltip(false)
                                            }
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
                                            }).format(
                                                new Date(message.createdAt)
                                            )}
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
                            if (message?.type === 2) return;
                            if (message.author?._id === auth?.user?._id)
                                editMessage();
                            else replyToMessage();
                        }}
                    >
                        {(hover || menu?.message === message?._id) &&
                            message?.type !== 2 && (
                                <span
                                    className={styles.messageTimestamp}
                                    onMouseEnter={() => setShowTooltip(3)}
                                    onMouseLeave={() => setShowTooltip(false)}
                                >
                                    <span>
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
                                            }).format(
                                                new Date(message.createdAt)
                                            )}
                                        </Tooltip>
                                    </span>
                                </span>
                            )}
                        {edit?.messageID === message._id ? (
                            <>
                                <TextArea
                                    editedMessage={
                                        editedMessage || message.content
                                    }
                                    setEditedMessage={setEditedMessage}
                                />
                                <div className={styles.editHint}>
                                    escape to{' '}
                                    <span
                                        onClick={() => {
                                            setEdit(null);
                                            localStorage.setItem(
                                                `channel-${params.channelID}`,
                                                JSON.stringify({
                                                    ...JSON.parse(
                                                        localStorage.getItem(
                                                            `channel-${params.channelID}`
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
                                    <span onClick={() => sendEditedMessage()}>
                                        save{' '}
                                    </span>
                                </div>
                            </>
                        ) : (
                            <div
                                style={{
                                    whiteSpace: 'pre-line',
                                    opacity: message.waiting ? 0.5 : 1,
                                    color: message.error
                                        ? 'var(--error-1)'
                                        : '',
                                }}
                            >
                                {message.content}{' '}
                                {message.edited && (
                                    <div className={styles.contentTimestamp}>
                                        <span
                                            onMouseEnter={() =>
                                                setShowTooltip(2)
                                            }
                                            onMouseLeave={() =>
                                                setShowTooltip(false)
                                            }
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
                                            }).format(
                                                new Date(message.updateddAt)
                                            )}
                                        </Tooltip>
                                    </div>
                                )}
                                {message?.type === 2 && (
                                    <span
                                        className={styles.contentTimestamp}
                                        onMouseEnter={() => setShowTooltip(3)}
                                        onMouseLeave={() =>
                                            setShowTooltip(false)
                                        }
                                        style={{
                                            userSelect: 'text',
                                        }}
                                    >
                                        <span>
                                            {new Intl.DateTimeFormat('en-US', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: 'numeric',
                                                minute: 'numeric',
                                                second: 'numeric',
                                            }).format(
                                                new Date(message.createdAt)
                                            )}
                                            <Tooltip
                                                show={showTooltip === 3}
                                                dist={3}
                                                delay={1}
                                            >
                                                {new Intl.DateTimeFormat(
                                                    'en-US',
                                                    {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        hour: 'numeric',
                                                        minute: 'numeric',
                                                        second: 'numeric',
                                                    }
                                                ).format(
                                                    new Date(message.createdAt)
                                                )}
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
    const [showTooltip, setShowTooltip] = useState(0);
    const [menuType, setMenuType] = useState('');

    const { auth }: any = useContextHook({
        context: 'auth',
    });
    const { setFixedLayer, fixedLayer }: any = useContextHook({
        context: 'layer',
    });
    const menuButtonRef = useRef(null);

    useEffect(() => {
        if (message?.author?.id.toString() === auth?.user?.id.toString()) {
            setMenuType('sender');
        } else {
            setMenuType('receiver');
        }
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

                    {menuType === 'sender' ? (
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
