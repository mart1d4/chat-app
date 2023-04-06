import styles from "./Message.module.css";
import { format, formatRelative } from "date-fns";
import { Tooltip, MessageMenu, TextArea } from "../";
import { useCallback, useEffect, useState } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import useComponents from "../../hooks/useComponents";
import { useRouter } from "next/router";
import Image from "next/image";
import useAuth from "../../hooks/useAuth";


const Message = ({ channelID, message, setMessages, start, edit, setEdit, reply, setReply, noInt }) => {
    const [showTooltip, setShowTooltip] = useState(null);
    const [hover, setHover] = useState(false);
    const [shift, setShift] = useState(false);
    const [editedMessage, setEditedMessage] = useState(
        (edit?.content || edit?.content === "")
            ? edit?.content : message.content
    );

    let noInteraction = noInt || false;

    const axiosPrivate = useAxiosPrivate();
    const router = useRouter();
    const { menu, setMenu, setPopup } = useComponents();
    const { auth } = useAuth();

    useEffect(() => {
        if (!editedMessage) return;

        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                setEdit(null);
                localStorage.setItem(`channel-${router.query.channelID}`, JSON.stringify({
                    ...JSON.parse(localStorage.getItem(`channel-${router.query.channelID}`)),
                    edit: null,
                }));
            } else if (e.key === "Enter" && e.shiftKey === false) {
                if (!edit || edit?.messageID !== message._id) return;
                sendEditedMessage();
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [editedMessage]);

    useEffect(() => {
        const handleShift = (e) => {
            if (e.key === "Shift") {
                setShift(true);
            }
        };

        const handleShiftUp = (e) => {
            if (e.key === "Shift") {
                setShift(false);
            }
        };

        document.addEventListener("keydown", handleShift);
        document.addEventListener("keyup", handleShiftUp);

        return () => {
            document.removeEventListener("keydown", handleShift);
            document.removeEventListener("keyup", handleShiftUp);
        };
    }, []);

    const checkMessageDate = (date) => {
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return (
            format(new Date(date), "PPPP") === format(today, "PPPP") ||
            format(new Date(date), "PPPP") === format(yesterday, "PPPP")
        );
    };

    const sendEditedMessage = async () => {
        if (editedMessage.length === 0) {
            console.log("Message is empty");
            setEdit(null);
            localStorage.setItem(`channel-${router.query.channelID}`, JSON.stringify({
                ...JSON.parse(localStorage.getItem(`channel-${router.query.channelID}`)),
                edit: null,
            }));
            return;
        } else if (editedMessage.length > 4000) {
            console.log("Message is too long");
            setEdit(null);
            localStorage.setItem(`channel-${router.query.channelID}`, JSON.stringify({
                ...JSON.parse(localStorage.getItem(`channel-${router.query.channelID}`)),
                edit: null,
            }));
            return;
        } else if (editedMessage === message.content) {
            console.log("Message is the same");
            setEdit(null);
            localStorage.setItem(`channel-${router.query.channelID}`, JSON.stringify({
                ...JSON.parse(localStorage.getItem(`channel-${router.query.channelID}`)),
                edit: null,
            }));
            return;
        }

        const response = await axiosPrivate.patch(
            `/channels/${router.query.channelID}/messages/${message._id}`,
            {
                content: editedMessage,
            }
        );

        if (!response.data.success) {
            console.log(response.data.message);
        } else {
            setMessages((messages) => {
                return messages.map((message) => {
                    if (message._id === response.data.message._id) {
                        return response.data.message;
                    } else {
                        return message;
                    }
                });
            });
        }

        setEdit(null);
        localStorage.setItem(`channel-${router.query.channelID}`, JSON.stringify({
            ...JSON.parse(localStorage.getItem(`channel-${router.query.channelID}`)),
            edit: null,
        }));
    }

    const deletePopup = () => {
        setPopup({
            delete: {
                channelID: channelID,
                message: message,
                func: () => deleteMessage(),
            }
        });
    };

    const deleteMessage = async () => {
        const response = await axiosPrivate.delete(
            `/channels/${channelID}/messages/${message._id}`
        );

        if (!response.data.success) {
            console.log(response.data.message);
        } else {
            setMessages((messages) => {
                return messages.filter(
                    (message) => message._id !== response.data.message._id
                );
            })
        }
    };

    const editMessage = async () => {
        setEdit({
            messageID: message._id,
            content: message.content,
        });

        localStorage.setItem(`channel-${router.query.channelID}`, JSON.stringify({
            ...JSON.parse(localStorage.getItem(`channel-${router.query.channelID}`)),
            edit: {
                messageID: message._id,
                content: message.content,
            },
        }));
    };

    const pinPopup = async () => {
        setPopup({
            pin: {
                channelID: channelID,
                message: message,
                func: () => pinMessage(),
            }
        });
    };

    const pinMessage = async () => {
        const response = await axiosPrivate.put(
            `/channels/${channelID}/pins/${message._id}`,
        );

        if (!response.data.success) {
            console.log(response.data.message);
        } else {
            setMessages((messages) => {
                return messages.map((message) => {
                    if (message._id === response.data.data._id) {
                        return response.data.data;
                    } else {
                        return message;
                    }
                });
            });
        }
    }

    const unpinPopup = async () => {
        setPopup({
            unpin: {
                channelID: channelID,
                message: message,
                func: () => unpinMessage(),
            }
        });
    };

    const unpinMessage = async () => {
        const response = await axiosPrivate.delete(
            `/channels/${channelID}/pins/${message._id}`,
        );

        if (!response.data.success) {
            console.log(response.data.message);
        } else {
            setMessages((messages) => {
                return messages.map((message) => {
                    if (message._id === response.data.data._id) {
                        return response.data.data;
                    } else {
                        return message;
                    }
                });
            });
        }
    }

    const replyToMessage = async () => {
        setReply(message);

        localStorage.setItem(`channel-${router.query.channelID}`, JSON.stringify({
            ...JSON.parse(localStorage.getItem(`channel-${router.query.channelID}`)),
            reply: message,
        }));
    };

    const markUnread = async () => {
        console.log(message._id);
    };

    const copyMessageLink = async () => {
        navigator.clipboard.writeText(
            `https://discord.com/channels/@me/${router.query.channelID}/${message._id}`
        );
    };

    const copyMessageID = () => {
        navigator.clipboard.writeText(message._id);
    };

    const senderItems = [
        { name: 'Edit Message', icon: "edit", func: editMessage },
        {
            name: message?.pinned ? 'Unpin Message' : 'Pin Message',
            icon: "pin",
            func: message?.pinned ? unpinPopup : pinPopup,
            funcShift: message?.pinned ? unpinMessage : pinMessage
        },
        { name: 'Reply', icon: "reply", func: replyToMessage },
        { name: 'Mark Unread', icon: "mark", func: markUnread },
        { name: 'Copy Message Link', icon: "link", func: copyMessageLink },
        { name: 'Delete Message', icon: "delete", func: deletePopup, funcShift: deleteMessage, danger: true },
        { name: 'Divider' },
        { name: 'Copy Message ID', icon: "id", func: copyMessageID },
    ];

    const receiverItems = [
        {
            name: message?.pinned ? 'Unpin Message' : 'Pin Message',
            icon: "pin",
            func: message?.pinned ? unpinPopup : pinPopup,
            funcShift: message?.pinned ? unpinMessage : pinMessage
        },
        { name: 'Reply', icon: "reply", func: replyToMessage, },
        { name: 'Mark Unread', icon: "mark", func: markUnread, },
        { name: 'Copy Message Link', icon: "link", func: copyMessageLink, },
        { name: 'Divider', },
        { name: 'Copy Message ID', icon: "id", func: copyMessageID, },
    ];

    return (
        <div
            className={
                reply?._id === message._id
                    ? styles.liReply + " " + styles.noInt : styles.li + " " + styles.noInt
            }
            onMouseEnter={() => {
                if (noInteraction) return;
                setHover(true);
            }}
            onMouseLeave={() => setHover(false)}
            onContextMenu={(e) => {
                e.preventDefault();
                if (noInteraction) return;
                setMenu({
                    items: message.author._id === auth?.user?._id ? senderItems : receiverItems,
                    event: e,
                    message: message._id,
                });
            }}
            style={(hover || (menu?.message === message?._id)) || edit?.messageID === message._id
                ? { backgroundColor: reply?._id === message._id ? "" : "var(--background-hover-4)" }
                : {}}
        >
            {((hover || (menu?.message === message?._id)) && (edit?.messageID !== message._id)) && (
                <MessageMenu
                    message={message}
                    start={start}
                    functions={{
                        deletePopup,
                        deleteMessage,
                        editMessage,
                        pinMessage,
                        replyToMessage,
                        markUnread,
                        copyMessageLink,
                        copyMessageID,
                    }}
                    menuItems={message.author._id === auth?.user?._id ? senderItems : receiverItems}
                />
            )}

            {(start || message.type === 1 || noInteraction) ? (
                <div className={styles.messageStart}>
                    {message.type === 1 && (
                        <div className={styles.messageReply}>
                            <Image
                                src={message.messageReference?.author?.avatar}
                                alt="Avatar"
                                width={16}
                                height={16}
                            />

                            <span>
                                {message.messageReference?.author?.username}
                            </span>

                            <div>
                                {message.messageReference?.content}
                            </div>
                        </div>
                    )}

                    <div
                        className={styles.messageContent}
                        onDoubleClick={() => {
                            if (noInteraction) return;
                            if (message.author._id === auth?.user?._id) {
                                editMessage();
                            } else {
                                replyToMessage();
                            }
                        }}
                    >
                        <Image
                            src={message.author.avatar}
                            alt="Avatar"
                            width={40}
                            height={40}
                            onDoubleClick={(e) => e.stopPropagation()}
                        />
                        <h3 onDoubleClick={(e) => e.stopPropagation()}>
                            <span className={styles.titleUsername}>
                                {message.author.username}
                            </span>
                            <span
                                className={styles.titleTimestamp}
                                onMouseEnter={() => setShowTooltip(1)}
                                onMouseLeave={() => setShowTooltip(null)}
                            >
                                {checkMessageDate(message.createdAt)
                                    ? formatRelative(
                                        new Date(message.createdAt),
                                        new Date()
                                    ).charAt(0).toUpperCase() + formatRelative(
                                        new Date(message.createdAt),
                                        new Date()).slice(1)
                                    : format(new Date(message.createdAt), "P p")}
                                <Tooltip
                                    show={showTooltip === 1}
                                    delay={1}
                                >
                                    {format(new Date(message.createdAt), "PPPP p")}
                                </Tooltip>
                            </span>
                        </h3>
                        {edit?.messageID === message._id ? (
                            <>
                                <TextArea
                                    editedMessage={editedMessage || " "}
                                    setEditedMessage={setEditedMessage}
                                />
                                <div className={styles.editHint}>
                                    escape to {" "}

                                    <span
                                        onClick={() => {
                                            setEdit(null);
                                            localStorage.setItem(`channel-${router.query.channelID}`, JSON.stringify({
                                                ...JSON.parse(localStorage.getItem(`channel-${router.query.channelID}`)),
                                                edit: null,
                                            }));
                                        }}
                                    >
                                        cancel {" "}
                                    </span>

                                    • enter to {" "}

                                    <span onClick={() => sendEditedMessage()}>
                                        save {" "}
                                    </span>
                                </div>
                            </>
                        ) : (
                            <div
                                style={{
                                    whiteSpace: "pre-line",
                                    opacity: message.waiting ? 0.5 : 1,
                                    color: message.error ? "var(--error-1)" : "",
                                }}
                            >
                                {message.content} {message.edited && (
                                    <div className={styles.contentTimestamp}>
                                        <span
                                            onMouseEnter={() => setShowTooltip("edited")}
                                            onMouseLeave={() => setShowTooltip(null)}
                                        >
                                            (edited)
                                        </span>

                                        <Tooltip
                                            show={showTooltip === "edited"}
                                            delay={1}
                                        >
                                            {format(new Date(message.updatedAt), "PPPP p")}
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
                            if (message.author._id === auth?.user?._id) {
                                editMessage();
                            } else {
                                replyToMessage();
                            }
                        }}
                    >
                        {(hover || (menu?.message === message?._id)) && (
                            <span
                                className={styles.messageTimestamp}
                                onMouseEnter={() => setShowTooltip(2)}
                                onMouseLeave={() => setShowTooltip(null)}
                            >
                                <span>
                                    {format(new Date(message.createdAt), "p")}
                                    <Tooltip
                                        show={showTooltip === 2}
                                        dist={3}
                                        delay={1}
                                    >
                                        {format(new Date(message.createdAt), "PPPP p")}
                                    </Tooltip>
                                </span>
                            </span>
                        )}
                        {edit?.messageID === message._id ? (
                            <>
                                <TextArea
                                    editedMessage={editedMessage || message.content}
                                    setEditedMessage={setEditedMessage}
                                />
                                <div className={styles.editHint}>
                                    escape to {" "}

                                    <span onClick={() => {
                                        setEdit(null);
                                        localStorage.setItem(`channel-${router.query.channelID}`, JSON.stringify({
                                            ...JSON.parse(localStorage.getItem(`channel-${router.query.channelID}`)),
                                            edit: null,
                                        }));
                                    }}>
                                        cancel {" "}
                                    </span>

                                    • enter to {" "}

                                    <span onClick={() => sendEditedMessage()}>
                                        save {" "}
                                    </span>
                                </div>
                            </>
                        ) : (
                            <div
                                style={{
                                    whiteSpace: "pre-line",
                                    opacity: message.waiting ? 0.5 : 1,
                                    color: message.error ? "var(--error-1)" : "",
                                }}
                            >
                                {message.content} {message.edited && (
                                    <div className={styles.contentTimestamp}>
                                        <span
                                            onMouseEnter={() => setShowTooltip("edited")}
                                            onMouseLeave={() => setShowTooltip(null)}
                                        >
                                            (edited)
                                        </span>

                                        <Tooltip
                                            show={showTooltip === "edited"}
                                            delay={1}
                                        >
                                            {format(new Date(message.updatedAt), "PPPP p")}
                                        </Tooltip>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Message;
