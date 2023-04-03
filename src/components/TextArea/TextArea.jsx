import { useState, useRef, useMemo, useEffect } from "react";
import styles from "./TextArea.module.css";
import { EmojiPicker, Icon, FilePreview } from "../";
import { v4 as uuidv4 } from "uuid";
import useUserData from "../../hooks/useUserData";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import useComponents from "../../hooks/useComponents";
import useAuth from "../../hooks/useAuth";

const TextArea = ({
    friend,
    userBlocked,
    channel,
    setMessages,
    editedMessage,
    setEditedMessage,
    reply,
    setReply
}) => {
    const [message, setMessage] = useState("");
    const [files, setFiles] = useState([]);
    const [friendTyping, setFriendTyping] = useState(false);
    const [error, setError] = useState(null);

    const textAreaRef = useRef(null);
    const { blocked, setBlocked, channels, setChannels } = useUserData();
    const axiosPrivate = useAxiosPrivate();

    useEffect(() => {
        if (reply) {
            textAreaRef.current.focus();
            moveCursorToEnd();
        }
    }, [reply]);

    const inputMenuItems = [
        {
            name: "Send Message Button",
            icon: "box",
            iconSize: 18,
        },
        { name: "Divider" },
        {
            name: "Spellcheck",
            icon: "box",
            iconSize: 18,
        },
        { name: "Divider" },
        {
            name: "Paste",
            text: "Ctrl+V",
            func: async () => {
                const text = await navigator.clipboard.readText();
                textAreaRef.current.innerText += text;
                setMessage((message) => message + text);
                moveCursorToEnd();
            },
        },
    ];

    useEffect(() => {
        if (!channel) return;

        const message = JSON.parse(localStorage.getItem(`channel-${channel._id}`))?.message;
        if (message) {
            setMessage(message);
            textAreaRef.current.innerText = message;
            moveCursorToEnd();
        } else {
            setMessage("");
            textAreaRef.current.innerText = "";
        }

        textAreaRef?.current?.focus();
    }, [channel]);

    useEffect(() => {
        if (!channel) return;

        localStorage.setItem(`channel-${channel._id}`, JSON.stringify({
            ...JSON.parse(localStorage.getItem(`channel-${channel._id}`)),
            message: message,
        }));
    }, [message]);

    useEffect(() => {
        if (!editedMessage) return;
        const text = textAreaRef.current.innerText;

        if (text !== editedMessage) {
            setMessage(editedMessage);
            textAreaRef.current.innerText = editedMessage;
            moveCursorToEnd();
        }
    }, [editedMessage]);

    const { auth } = useAuth();
    const { setMenu } = useComponents();

    const unblockUser = async () => {
        const response = await axiosPrivate.post(
            `/users/${friend._id}`,
        );

        if (!response.data.success) {
            setError(response.data.message);
        } else if (response.data.success) {
            setBlocked(blocked.filter((blocked) => blocked._id.toString() !== friend._id));
        } else {
            setError("An error occurred.");
        }
    };

    const moveCursorToEnd = () => {
        textAreaRef.current.focus();
        if (
            typeof window.getSelection != "undefined" &&
            typeof document.createRange != "undefined"
        ) {
            const range = document.createRange();
            range.selectNodeContents(textAreaRef.current);
            range.collapse(false);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        } else if (typeof document.body.createTextRange != "undefined") {
            const textRange = document.body.createTextRange();
            textRange.moveToElementText(textAreaRef.current);
            textRange.collapse(false);
            textRange.select();
        }
    };

    const sendMessage = async () => {
        if (message.length === 0 && files.length === 0) {
            return;
        }

        let messageContent = message;

        while (messageContent.startsWith("\n") || messageContent.endsWith("\n")) {
            // Onlye remove the first or last newline
            if (messageContent.startsWith("\n")) {
                messageContent = messageContent.substring(1);
            }
            if (messageContent.endsWith("\n")) {
                messageContent = messageContent.substring(0, messageContent.length - 1);
            }
        }

        const id = uuidv4();
        const messRef = reply ?? null;

        setMessages((messages) => [...messages, {
            _id: id,
            content: messageContent,
            attachments: files,
            author: auth.user,
            messageReference: messRef,
            createdAt: new Date(),
            error: false,
            waiting: true,
        }]);

        textAreaRef.current.innerText = "";
        setMessage("");
        setFiles([]);

        if (reply) {
            setReply(null);
            localStorage.setItem(`channel-${channel._id}`, JSON.stringify({
                ...JSON.parse(localStorage.getItem(`channel-${channel._id}`)),
                reply: null,
            }));
        }

        const channelIndex = channels.findIndex((chan) => chan._id === channel._id);
        const newChannels = [...channels];
        newChannels.splice(channelIndex, 1);
        newChannels.unshift(channel);
        setChannels(newChannels);

        const response = await axiosPrivate.post(
            `/channels/${channel._id}/messages`,
            {
                message: {
                    content: message,
                    attachments: files,
                    messageReference: messRef?._id ?? null,
                },
            },
        );

        if (!response.data.success) {
            setError(response.data.message);
            setMessages((messages) => messages.map((message) => {
                if (message._id === id) {
                    return {
                        ...message,
                        error: true,
                    };
                }
                return message;
            }));
        } else if (response.data.success) {
            setMessages((messages) => messages.map((message) => {
                if (message._id === id) {
                    return {
                        ...response.data.message,
                        error: false,
                        waiting: false,
                    };
                }
                return message;
            }));
        } else {
            setError("An error occurred.");
            setMessages((messages) => messages.map((message) => {
                if (message._id === id) {
                    return {
                        ...message,
                        error: true,
                    };
                }
                return message;
            }));
        }
    };

    const textContainer = useMemo(() => (
        <div
            className={styles.textContainer}
            style={{ height: textAreaRef?.current?.scrollHeight || 44 }}
        >
            <div>
                {(message.length === 0 && !editedMessage) && (
                    <div className={styles.textContainerPlaceholder}>
                        Message {friend ? `@${friend.username}` : channel?.name}
                    </div>
                )}

                <div
                    ref={textAreaRef}
                    className={styles.textContainerInner}
                    role="textarea"
                    spellCheck="true"
                    autoCorrect="off"
                    aria-multiline="true"
                    aria-label={
                        editedMessage ? "Edit Message"
                            : `Message ${friend ? `@${friend.username}` : channel?.name}`
                    }
                    aria-autocomplete="list"
                    contentEditable="true"
                    onInput={(e) => {
                        const text = e.target.innerText.toString();
                        if (editedMessage) setEditedMessage(text);
                        setMessage(text);
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            if (editedMessage) return;
                            sendMessage();
                            setMessage("");
                            e.target.innerText = "";
                        }
                    }}
                    onContextMenu={(e) => {
                        e.preventDefault();
                        setMenu({
                            event: e,
                            items: inputMenuItems,
                        });
                    }}
                />
            </div>
        </div>
    ), [message, friend, channel, editedMessage]);

    const imageList = useMemo(() => (
        <ul className={styles.filesList}>
            {files?.map((file) => (
                <FilePreview
                    key={uuidv4()}
                    file={file}
                    setFiles={setFiles}
                />
            ))}
        </ul>
    ), [files]);

    const caracterCounter = useMemo(() => (
        <div className={styles.counterContainer}>
            <span
                style={{
                    color: message.length > 4000
                        ? "var(--error-1)"
                        : "var(--foreground-3)"
                }}
            >
                {message.length}
            </span>/4000
        </div>
    ), [message]);

    if (editedMessage) return (
        <form
            className={styles.form}
            style={{
                padding: "0 0 0 0",
                marginTop: "8px",
            }}
        >
            <div
                className={styles.textArea}
                style={{
                    marginBottom: "0",
                }}
            >
                <div className={styles.scrollableContainer}>
                    <div className={styles.input}>
                        {textContainer}

                        <div className={styles.toolsContainer}>
                            <EmojiPicker />
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );

    else if (!userBlocked) return (
        <form className={styles.form} >
            {reply?.channelId === channel?._id && (
                <div className={styles.replyContainer}>
                    <div className={styles.replyName}>
                        Replying to <span>{reply?.author?.username}</span>
                    </div>

                    <div
                        className={styles.replyClose}
                        onClick={() => {
                            setReply(null);
                            localStorage.setItem(`channel-${channel._id}`, JSON.stringify({
                                ...JSON.parse(localStorage.getItem(`channel-${channel._id}`)),
                                reply: null,
                            }));
                        }}
                    >
                        <div>
                            <Icon
                                name="closeFilled"
                                size={16}
                                viewbox={"0 0 14 14"}
                            />
                        </div>
                    </div>
                </div>
            )}

            <div
                className={styles.textArea}
                style={{
                    borderRadius: reply?.channelId === channel?._id ? "0 0 8px 8px" : "8px",
                }}
            >
                <div className={styles.scrollableContainer}>
                    {files.length > 0 && (
                        <>
                            {imageList}
                            <div className={styles.formDivider} />
                        </>
                    )}

                    <div className={styles.input}>
                        <div className={styles.attachWrapper}>
                            <input
                                type="file"
                                id="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => {
                                    const newFiles = Array.from(e.target.files);
                                    if (files.length + newFiles.length > 10) {
                                        setError("You can only attach up to 10 files");
                                        return;
                                    }
                                    setFiles(files.concat(newFiles).slice(0, 10));
                                }}
                                style={{ display: "none" }}
                            />

                            <button
                                onClick={(e) => e.preventDefault()}
                                onDoubleClick={(e) => {
                                    e.preventDefault();
                                    document.getElementById("file").click();
                                }}
                            >
                                <div>
                                    <Icon name="attach" />
                                </div>
                            </button>
                        </div>

                        {textContainer}

                        <div className={styles.toolsContainer}>
                            <button>
                                <Icon
                                    name="keyboard"
                                    size={30}
                                />
                            </button>

                            <button>
                                <Icon
                                    name="gif"
                                />
                            </button>

                            <EmojiPicker />
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.bottomForm}>
                <div className={styles.typingContainer}>
                    {friendTyping && (
                        <>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24.5"
                                height="7"
                            >
                                <circle cx="3.5" cy="3.5" r="3.5" />
                                <circle cx="12.25" cy="3.5" r="3.5" />
                                <circle cx="21" cy="3.5" r="3.5" />
                            </svg>
                            <span>
                                <strong>{friend?.username}</strong> is typing...
                            </span>
                        </>
                    )}
                </div>

                {caracterCounter}
            </div>
        </form >
    );

    else return (
        <form className={styles.form}>
            <div className={styles.wrapperBlocked}>
                <div>
                    You cannot send messages to a user you have blocked.
                </div>

                <button
                    className="grey"
                    onClick={(e) => {
                        e.preventDefault();
                        unblockUser();
                    }}
                >
                    Unblock
                </button>
            </div>
        </form>
    );
}

export default TextArea;
