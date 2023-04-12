import { useState, useRef, useMemo, useEffect } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import useComponents from "../../hooks/useComponents";
import useUserData from "../../hooks/useUserData";
import useAuth from "../../hooks/useAuth";
import styles from "./TextArea.module.css";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { Icon, Tooltip } from "../";
import { v4 as uuidv4 } from "uuid";
import useUserSettings from "../../hooks/useUserSettings";

const TextArea = ({ friend, userBlocked, channel, setMessages,
    editedMessage, setEditedMessage, reply, setReply
}) => {
    const [message, setMessage] = useState("");
    const [files, setFiles] = useState([]);
    const [friendTyping, setFriendTyping] = useState(false);

    const { auth } = useAuth();
    const { userSettings } = useUserSettings();
    const { setFixedLayer } = useComponents();
    const { blocked, setBlocked, channels, setChannels } = useUserData();
    const axiosPrivate = useAxiosPrivate();
    const router = useRouter();
    const textAreaRef = useRef(null);

    useEffect(() => {
        if (reply) {
            textAreaRef.current.focus();
            moveCursorToEnd();
        }
    }, [reply]);

    const pasteText = async () => {
        const text = await navigator.clipboard.readText();
        textAreaRef.current.innerText += text;
        setMessage((message) => message + text);
        moveCursorToEnd();
    };

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

        if (textAreaRef.current.innerHTML.includes("<span")) {
            const cursorPosition = window.getSelection().getRangeAt(0).startOffset;
            textAreaRef.current.innerText = message;
            moveCursorToEnd();
        }
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

    const unblockUser = async () => {
        const response = await axiosPrivate.post(
            `/users/${friend._id}`,
        );

        if (response.data.success) {
            setBlocked(blocked.filter((blocked) => blocked._id.toString() !== friend._id));
        };
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

        while (messageContent.startsWith("\n")) {
            messageContent = messageContent.substring(1);
        }
        while (messageContent.endsWith("\n")) {
            messageContent = messageContent.substring(0, messageContent.length - 1);
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
                        _id: response.data.message._id,
                        error: false,
                        waiting: false,
                    };
                }
                return message;
            }));
        } else {
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
                    contentEditable="plaintext-only"
                    onInput={(e) => {
                        const text = e.target.innerText.toString();
                        if (editedMessage) {
                            setEditedMessage(text)
                            localStorage.setItem(`channel-${router.query.channelID}`, JSON.stringify({
                                ...JSON.parse(localStorage.getItem(`channel-${router.query.channelID}`)),
                                edit: {
                                    ...JSON.parse(localStorage.getItem(`channel-${router.query.channelID}`)).edit,
                                    content: text,
                                }
                            }));
                        };
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
                        setFixedLayer({
                            type: "menu",
                            event: e,
                            input: true,
                            pasteText,
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
                <div className={styles.scrollableContainer + " scrollbar"}>
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
            {reply?.channel === channel?._id && (
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
                <div className={styles.scrollableContainer + " scrollbar"}>
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
                            <button onClick={(e) => e.preventDefault()}>
                                <Icon
                                    name="keyboard"
                                    size={30}
                                />
                            </button>

                            <button onClick={(e) => e.preventDefault()}>
                                <Icon
                                    name="gif"
                                />
                            </button>

                            <EmojiPicker />

                            {userSettings?.sendButton && (
                                <button
                                    className={styles.sendButton}
                                    onClick={(e) => e.preventDefault()}
                                >
                                    <div>
                                        <Icon
                                            name="sendButton"
                                            size={20}
                                        />
                                    </div>
                                </button>
                            )}
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

const emojisPos = [
    { x: 0, y: 0 }, { x: 0, y: -22 }, { x: 0, y: -44 }, { x: 0, y: -66 }, { x: 0, y: -88 },
    { x: -22, y: 0 }, { x: -22, y: -22 }, { x: -22, y: -44 }, { x: -22, y: -66 }, { x: -22, y: -88 },
    { x: -44, y: 0 }, { x: -44, y: -22 }, { x: -44, y: -44 }, { x: -44, y: -66 }, { x: -44, y: -88 },
    { x: -66, y: 0 }, { x: -66, y: -22 }, { x: -66, y: -44 }, { x: -66, y: -66 }, { x: -66, y: -88 },
    { x: -88, y: 0 }, { x: -88, y: -22 }, { x: -88, y: -44 }, { x: -88, y: -66 }, { x: -88, y: -88 },
    { x: -110, y: 0 }, { x: -110, y: -22 }, { x: -110, y: -44 }, { x: -110, y: -66 }, { x: -110, y: -88 },
    { x: -132, y: 0 }, { x: -132, y: -22 }, { x: -132, y: -44 }, { x: -132, y: -66 },
    { x: -154, y: 0 }, { x: -154, y: -22 }, { x: -154, y: -44 }, { x: -154, y: -66 },
    { x: -176, y: 0 }, { x: -176, y: -22 }, { x: -176, y: -44 }, { x: -176, y: -66 },
    { x: -198, y: 0 }, { x: -198, y: -22 }, { x: -198, y: -44 }, { x: -198, y: -66 },
    { x: -220, y: 0 }, { x: -220, y: -22 }, { x: -220, y: -44 }, { x: -220, y: -66 },
];

const scale = {
    hover: {
        scale: 1.15,
        transition: {
            duration: 0.1,
            ease: "easeInOut",
        }
    }
};

const EmojiPicker = () => {
    const [emojisPosIndex, setEmojisPosIndex] = useState(
        Math.floor(Math.random() * emojisPos.length)
    );

    return (
        <motion.button
            onMouseEnter={() => setEmojisPosIndex(
                Math.floor(Math.random() * emojisPos.length)
            )}
            onClick={(e) => e.preventDefault()}
            className={styles.buttonContainer}
            whileHover="hover"
        >
            <motion.div
                className={styles.emoji}
                style={{
                    backgroundPosition:
                        `${emojisPos[emojisPosIndex].x}px ${emojisPos[emojisPosIndex].y}px`
                }}
                variants={scale}
            >
            </motion.div>
        </motion.button>
    );
}

const FilePreview = ({ file, setFiles }) => {
    const [showTooltip, setShowTooltip] = useState(null);

    return useMemo(() => (
        <li className={styles.fileItem}>
            <div className={styles.fileItemContainer}>
                <div className={styles.image}>
                    <img
                        src={URL.createObjectURL(file)}
                        alt="File Preview"
                    />
                </div>

                <div className={styles.fileName}>
                    <div>
                        {file.name}
                    </div>
                </div>
            </div>

            <div className={styles.fileMenu}>
                <div>
                    <div>
                        <div
                            className={styles.fileMenuButton}
                            onMouseEnter={() => setShowTooltip(1)}
                            onMouseLeave={() => setShowTooltip(null)}
                        >
                            <Icon name="eye" size={20} />
                        </div>
                        <Tooltip
                            show={showTooltip === 1}
                            pos="top"
                            dist={5}
                        >
                            Spoiler Attachment
                        </Tooltip>
                    </div>

                    <div>
                        <div
                            className={styles.fileMenuButton}
                            onMouseEnter={() => setShowTooltip(2)}
                            onMouseLeave={() => setShowTooltip(null)}
                        >
                            <Icon name="edit" size={20} />
                        </div>
                        <Tooltip
                            show={showTooltip === 2}
                            pos="top"
                            dist={5}
                        >
                            Modify Attachment
                        </Tooltip>
                    </div>

                    <div>
                        <div
                            className={styles.fileMenuButton + " " + styles.danger}
                            onMouseEnter={() => setShowTooltip(3)}
                            onMouseLeave={() => setShowTooltip(null)}
                            onClick={() => setFiles(
                                (files) => files.filter((f) => f !== file)
                            )}
                        >
                            <Icon
                                name="delete"
                                size={20}
                                fill="var(--error-1)"
                            />
                        </div>
                        <Tooltip
                            show={showTooltip === 3}
                            pos="top"
                            dist={5}
                        >
                            Remove Attachment
                        </Tooltip>
                    </div>
                </div>
            </div>
        </li>
    ), [showTooltip]);
};

export default TextArea;
