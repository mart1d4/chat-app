"use client";

import { useData, useLayers, useMention, useMessages, useSettings, useTooltip } from "@/lib/store";
import { Editor, EditorState, Modifier, ContentState, getDefaultKeyBinding } from "draft-js";
import { useState, useRef, useMemo, useEffect } from "react";
import useFetchHelper from "@/hooks/useFetchHelper";
import { Icon, LoadingDots } from "@components";
import { sanitizeString } from "@/lib/strings";
import styles from "./TextArea.module.css";
import filetypeinfo from "magic-bytes.js";
import { v4 as uuidv4 } from "uuid";
import "draft-js/dist/Draft.css";

const allowedFileTypes = ["image/png", "image/jpeg", "image/gif", "image/webp", "image/apng"];

export const TextArea = ({ channel, setMessages, editing }: any) => {
    const setMessageAttachment = useMessages((state) => state.setAttachments);
    const setContent = useMessages((state) => state.setContent);
    const setTooltip = useTooltip((state) => state.setTooltip);
    const setMention = useMention((state) => state.setMention);
    const settings = useSettings((state) => state.settings);
    const setLayers = useLayers((state) => state.setLayers);
    const setReply = useMessages((state) => state.setReply);
    const replies = useMessages((state) => state.replies);
    const setEdit = useMessages((state) => state.setEdit);
    const mention = useMention((state) => state.userId);
    const drafts = useMessages((state) => state.drafts);
    const edits = useMessages((state) => state.edits);
    const user = useData((state) => state.user);
    const { sendRequest } = useFetchHelper();

    const reply = replies.find((r) => r.channelId === channel.id);
    const draft = drafts.find((d) => d.channelId === channel.id);
    const edit = edits.find((e) => e.channelId === channel.id);

    const [attachments, setAttachments] = useState(draft?.attachments || []);
    const [usersTyping, setUsersTyping] = useState([]);
    const [editorState, setEditorState] = useState(() => {
        return draft?.content
            ? EditorState.createWithContent(draft.content)
            : EditorState.createEmpty();
    });
    const [message, setMessage] = useState("");

    const fileInputRef = useRef<HTMLInputElement>(null);
    const textAreaRef = useRef<HTMLDivElement>(null);

    const blocked = useData((state) => state.blocked).map((user) => user.id);
    const friend = channel.recipients?.find((r: any) => r.id !== user.id);

    useEffect(() => {
        setMessage(editorState.getCurrentContent().getPlainText());
    }, [editorState]);

    useEffect(() => {
        if (!mention || editing) return;

        // Get whether some text has been selected
        // If so, replace instead of inserting

        const hasSelection = !editorState.getSelection().isCollapsed();

        if (hasSelection) {
            const newEditor = Modifier.replaceText(
                editorState.getCurrentContent(),
                editorState.getSelection(),
                `<@${mention}>`
            );

            setEditorState(EditorState.push(editorState, newEditor, "insert-characters"));
            EditorState.forceSelection(editorState, newEditor.getSelectionAfter());
        } else {
            const newEditor = Modifier.insertText(
                editorState.getCurrentContent(),
                editorState.getSelection(),
                `<@${mention}>`
            );

            setEditorState(EditorState.push(editorState, newEditor, "insert-characters"));
            EditorState.forceSelection(editorState, newEditor.getSelectionAfter());
        }
        setMention(null);
    }, [mention, editing]);

    useEffect(() => {
        if (edit || reply) {
            const input = textAreaRef.current;
            if (input) input.focus();
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setEdit(channel.id, null);
                setReply(channel.id, null, "");
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [edit, reply]);

    useEffect(() => {
        setContent(channel.id, message);
    }, [message]);

    useEffect(() => {
        setMessageAttachment(channel.id, attachments);
    }, [attachments]);

    useEffect(() => {
        if (!edit || !editing) return;

        const input = textAreaRef.current;
        if (input) input.innerText = edit?.content || "";
    }, [edit, editing]);

    const sendMessage = async () => {
        let messageContent = sanitizeString(message);

        if (!messageContent && attachments.length === 0) return;
        if (messageContent && messageContent.length > 16000) {
            return setLayers({
                settings: {
                    type: "POPUP",
                },
                content: {
                    type: "WARNING",
                    warning: "MESSAGE_LIMIT",
                },
            });
        }

        const tempMessage = {
            id: uuidv4(),
            content: messageContent,
            attachments: attachments,
            author: user,
            channelId: [channel.id],
            reference: reply?.messageId ?? null,
            createdAt: new Date(),
            needsToBeSent: true,
        };

        // Reset the editor state
        const newState = EditorState.push(
            editorState,
            ContentState.createFromText(""),
            "remove-range"
        );

        setEditorState(newState);

        setAttachments([]);
        setMessages((messages) => [...messages, tempMessage]);

        if (reply?.messageId) setReply(channel.id, null, "");
    };

    function myKeyBindingFn(e: SyntheticKeyboardEvent): string | null {
        if (e.key === "Enter" && !e.shiftKey) {
            return "message-send";
        }
        return getDefaultKeyBinding(e);
    }

    function handleKeyCommand(command: string): DraftHandleValue {
        if (command === "message-send") {
            return sendMessage();
        }
        return "not-handled";
    }

    const textContainer = (
        <div
            className={styles.textContainer}
            style={{ height: textAreaRef.current?.scrollHeight || 44 }}
        >
            <div
                ref={textAreaRef}
                className={styles.textbox}
            >
                <Editor
                    editorState={editorState}
                    onChange={setEditorState}
                    placeholder={
                        (editing ? edit?.content?.length === 0 : message.length === 0)
                            ? edit?.messageId && editing
                                ? "Edit Message"
                                : `Message ${
                                      channel.type === 0 ? "@" : channel.type === 2 ? "#" : ""
                                  }${channel.name}`
                            : ""
                    }
                    spellCheck={true}
                    stripPastedStyles={true}
                    handleKeyCommand={handleKeyCommand}
                    keyBindingFn={myKeyBindingFn}
                />
            </div>
        </div>
    );

    if (edit?.messageId && editing) {
        return (
            <form
                className={styles.form}
                style={{ padding: "0 0 0 0", marginTop: "8px" }}
            >
                <div
                    className={styles.textArea}
                    style={{ marginBottom: "0" }}
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
    } else if (!blocked.includes(friend?.id)) {
        return (
            <form className={styles.form}>
                {reply?.messageId && !editing && (
                    <div className={styles.replyContainer}>
                        <div className={styles.replyName}>
                            Replying to <span>{reply?.username || "User"}</span>
                        </div>

                        <div
                            className={styles.replyClose}
                            onClick={() => setReply(channel.id, null, "")}
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
                    style={{ borderRadius: reply?.messageId ? "0 0 8px 8px" : "8px" }}
                >
                    <div className={styles.scrollableContainer + " scrollbar"}>
                        {attachments.length > 0 && (
                            <>
                                <ul className={styles.filesList + " scrollbar"}>
                                    {attachments.map((a) => (
                                        <FilePreview
                                            key={a.id}
                                            attachment={a}
                                            setAttachments={setAttachments}
                                        />
                                    ))}
                                </ul>
                                <div className={styles.formDivider} />
                            </>
                        )}

                        <div className={styles.input}>
                            <div className={styles.attachWrapper}>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="*"
                                    multiple
                                    onChange={async (e) => {
                                        const newFiles = Array.from(e.target.files as FileList);

                                        if (attachments.length + newFiles.length > 10) {
                                            setLayers({
                                                settings: {
                                                    type: "POPUP",
                                                },
                                                content: {
                                                    type: "WARNING",
                                                    warning: "FILE_NUMBER",
                                                },
                                            });

                                            return (e.target.value = "");
                                        }

                                        let checkedFiles = [];
                                        const maxFileSize = 1024 * 1024 * 10; // 10MB

                                        for (const file of newFiles) {
                                            if (file.size > maxFileSize) {
                                                setLayers({
                                                    settings: {
                                                        type: "POPUP",
                                                    },
                                                    content: {
                                                        type: "WARNING",
                                                        warning: "FILE_SIZE",
                                                    },
                                                });

                                                checkedFiles = [];
                                                return (e.target.value = "");
                                            }

                                            const fileBytes = new Uint8Array(
                                                await file.arrayBuffer()
                                            );
                                            const fileType = filetypeinfo(fileBytes);

                                            if (
                                                !fileType ||
                                                !allowedFileTypes.includes(fileType[0]?.mime ?? "")
                                            ) {
                                                setLayers({
                                                    settings: {
                                                        type: "POPUP",
                                                    },
                                                    content: {
                                                        type: "WARNING",
                                                        warning: "FILE_TYPE",
                                                    },
                                                });

                                                return (e.target.value = "");
                                            }

                                            const image = await new Promise<HTMLImageElement>(
                                                (resolve) => {
                                                    const img = new Image();
                                                    img.onload = () => resolve(img);
                                                    img.src = URL.createObjectURL(file);
                                                }
                                            );

                                            const dimensions = {
                                                height: image.height,
                                                width: image.width,
                                            };

                                            checkedFiles.push({
                                                id: uuidv4(),
                                                url: URL.createObjectURL(file),
                                                name: file.name ?? "file",
                                                dimensions,
                                                size: file.size,
                                                isSpoiler: file.name
                                                    ? file.name.startsWith("SPOILER_")
                                                    : false,
                                                isImage: allowedFileTypes.includes(
                                                    fileType[0]?.mime ?? ""
                                                ),
                                                description: "",
                                            });
                                        }

                                        setAttachments([...attachments, ...checkedFiles]);
                                        e.target.value = "";
                                    }}
                                    style={{ display: "none" }}
                                />

                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setLayers({
                                            settings: {
                                                type: "MENU",
                                                element: e.currentTarget,
                                                firstSide: "TOP",
                                                secondSide: "RIGHT",
                                                gap: 10,
                                            },
                                            content: {
                                                type: "FILE_INPUT",
                                                openInput: () => fileInputRef.current?.click(),
                                            },
                                        });
                                    }}
                                    onDoubleClick={(e) => {
                                        e.preventDefault();
                                        fileInputRef.current?.click();
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            fileInputRef.current?.click();
                                        }
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
                                    <Icon name="gif" />
                                </button>

                                <button onClick={(e) => e.preventDefault()}>
                                    <Icon name="sticker" />
                                </button>

                                <EmojiPicker />

                                {settings.sendButton && (
                                    <button
                                        className={`${styles.sendButton} ${
                                            !message.length && !attachments.length
                                                ? styles.empty
                                                : ""
                                        }`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (edit?.messageId) return;
                                            sendMessage();
                                        }}
                                        disabled={message.length === 0 && attachments.length === 0}
                                        style={{
                                            cursor:
                                                message.length === 0 && attachments.length === 0
                                                    ? "not-allowed"
                                                    : "pointer",
                                            opacity:
                                                message.length === 0 && attachments.length === 0
                                                    ? 0.3
                                                    : 1,
                                            color:
                                                message.length === 0 && attachments.length === 0
                                                    ? "var(--foreground-5)"
                                                    : "",
                                        }}
                                    >
                                        <div>
                                            <svg
                                                width="16"
                                                height="16"
                                                viewBox="0 0 16 16"
                                            >
                                                <path
                                                    d="M8.2738 8.49222L1.99997 9.09877L0.349029 14.3788C0.250591 14.691 0.347154 15.0322 0.595581 15.246C0.843069 15.4597 1.19464 15.5047 1.48903 15.3613L15.2384 8.7032C15.5075 8.57195 15.6781 8.29914 15.6781 8.00007C15.6781 7.70101 15.5074 7.4282 15.2384 7.29694L1.49839 0.634063C1.20401 0.490625 0.852453 0.535625 0.604941 0.749376C0.356493 0.963128 0.259941 1.30344 0.358389 1.61563L2.00932 6.89563L8.27093 7.50312C8.52405 7.52843 8.71718 7.74125 8.71718 7.99531C8.71718 8.24938 8.52406 8.46218 8.27093 8.4875L8.2738 8.49222Z"
                                                    fill="currentColor"
                                                ></path>
                                            </svg>
                                        </div>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.bottomForm}>
                    <div className={styles.typingContainer}>
                        {usersTyping.length > 0 && (
                            <>
                                <LoadingDots />
                                <span>
                                    {usersTyping.map((username) => (
                                        <span>{username}, </span>
                                    ))}

                                    {usersTyping.length > 0 ? "are typing..." : "is typing..."}
                                </span>
                            </>
                        )}
                    </div>

                    <div
                        className={styles.counterContainer}
                        onMouseEnter={(e) =>
                            setTooltip({
                                text:
                                    message.length > 16000
                                        ? "Message is too long"
                                        : `${16000 - message.length} characters remaining`,
                                element: e.currentTarget,
                            })
                        }
                        onMouseLeave={() => setTooltip(null)}
                    >
                        <span
                            style={{
                                color:
                                    message.length > 16000
                                        ? "var(--error-1)"
                                        : "var(--foreground-3)",
                            }}
                        >
                            {message.length}
                        </span>
                        /16000
                    </div>
                </div>
            </form>
        );
    } else {
        return (
            <form className={styles.form}>
                <div className={styles.wrapperBlocked}>
                    <div>You cannot send messages to a user you have blocked.</div>

                    <button
                        className="button grey"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            sendRequest({
                                query: "UNBLOCK_USER",
                                params: { userId: friend.id },
                            });
                        }}
                    >
                        Unblock
                    </button>
                </div>
            </form>
        );
    }
};

const UserMention = ({ user, full }: { user: TCleanUser; full?: boolean }) => {
    const setLayers = useLayers((state) => state.setLayers);
    const layers = useLayers((state) => state.layers);

    return (
        <span
            className={full ? styles.mention : styles.inlineMention}
            onClick={(e) => {
                if (layers.USER_CARD?.settings.element === e.currentTarget) return;
                setLayers({
                    settings: {
                        type: "USER_CARD",
                        element: e.currentTarget,
                        firstSide: "RIGHT",
                        gap: 10,
                    },
                    content: {
                        user: user,
                    },
                });
            }}
            onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (layers.MENU?.settings.element === e.currentTarget) return;
                setLayers({
                    settings: {
                        type: "MENU",
                        event: e,
                    },
                    content: {
                        type: "USER",
                        user: user,
                    },
                });
            }}
        >
            {full && "@"}
            {user.username}
        </span>
    );
};

const emojisPos = [
    { x: 0, y: 0 },
    { x: 0, y: -22 },
    { x: 0, y: -44 },
    { x: 0, y: -66 },
    { x: 0, y: -88 },
    { x: -22, y: 0 },
    { x: -22, y: -22 },
    { x: -22, y: -44 },
    { x: -22, y: -66 },
    { x: -22, y: -88 },
    { x: -44, y: 0 },
    { x: -44, y: -22 },
    { x: -44, y: -44 },
    { x: -44, y: -66 },
    { x: -44, y: -88 },
    { x: -66, y: 0 },
    { x: -66, y: -22 },
    { x: -66, y: -44 },
    { x: -66, y: -66 },
    { x: -66, y: -88 },
    { x: -88, y: 0 },
    { x: -88, y: -22 },
    { x: -88, y: -44 },
    { x: -88, y: -66 },
    { x: -88, y: -88 },
    { x: -110, y: 0 },
    { x: -110, y: -22 },
    { x: -110, y: -44 },
    { x: -110, y: -66 },
    { x: -110, y: -88 },
    { x: -132, y: 0 },
    { x: -132, y: -22 },
    { x: -132, y: -44 },
    { x: -132, y: -66 },
    { x: -154, y: 0 },
    { x: -154, y: -22 },
    { x: -154, y: -44 },
    { x: -154, y: -66 },
    { x: -176, y: 0 },
    { x: -176, y: -22 },
    { x: -176, y: -44 },
    { x: -176, y: -66 },
    { x: -198, y: 0 },
    { x: -198, y: -22 },
    { x: -198, y: -44 },
    { x: -198, y: -66 },
    { x: -220, y: 0 },
    { x: -220, y: -22 },
    { x: -220, y: -44 },
    { x: -220, y: -66 },
];

export const EmojiPicker = () => {
    const [emojisPosIndex, setEmojisPosIndex] = useState(
        Math.floor(Math.random() * emojisPos.length)
    );

    return (
        <button
            onMouseEnter={() => setEmojisPosIndex(Math.floor(Math.random() * emojisPos.length))}
            onClick={(e) => e.preventDefault()}
            className={styles.buttonContainer}
        >
            <div
                className={styles.emoji}
                style={{
                    backgroundImage:
                        "url('https://ucarecdn.com/1eec089f-78a5-4ea5-9fc9-f4d99db3e74c/')",
                    backgroundPosition: `${emojisPos[emojisPosIndex].x}px ${emojisPos[emojisPosIndex].y}px`,
                }}
            />
        </button>
    );
};

const FilePreview = ({ attachment, setAttachments }: any) => {
    const [hideSpoiler, setHideSpoiler] = useState<boolean>(false);

    const setTooltip = useTooltip((state) => state.setTooltip);
    const setLayers = useLayers((state) => state.setLayers);

    const isSpoiler = attachment.isSpoiler;
    const isImage = attachment.isImage;

    const handleFileChange = (data: any) => {
        setAttachments((attachments: TAttachment[]) =>
            attachments.map((a) =>
                a.id === a.id
                    ? {
                          ...a,
                          name: data.filename,
                          isSpoiler: data.isSpoiler,
                          description: data.description,
                      }
                    : a
            )
        );
    };

    return useMemo(() => {
        if (typeof isImage !== "boolean") {
            return <></>;
        }

        return (
            <li className={styles.fileItem}>
                <div className={styles.fileItemContainer}>
                    <div
                        className={styles.image}
                        style={{
                            backgroundColor:
                                isSpoiler && !hideSpoiler ? "var(--background-dark-3)" : "",
                            cursor: isSpoiler && !hideSpoiler ? "pointer" : "default",
                        }}
                        onClick={() => isSpoiler && setHideSpoiler(true)}
                    >
                        {isSpoiler && !hideSpoiler && (
                            <div className={styles.spoilerButton}>Spoiler</div>
                        )}

                        <img
                            src={
                                isImage
                                    ? attachment.url
                                    : "https://ucarecdn.com/d2524731-0ab6-4360-b6c8-fc9d5b8147c8/"
                            }
                            alt="File Preview"
                            style={{ filter: isSpoiler && !hideSpoiler ? "blur(44px)" : "none" }}
                        />

                        <div className={styles.imageTags}>
                            {attachment.description && <span>Alt</span>}
                            {isSpoiler && hideSpoiler && <span>Spoiler</span>}
                        </div>
                    </div>

                    <div className={styles.fileName}>
                        <div>{isSpoiler ? attachment.name.slice(8) : attachment.name}</div>
                    </div>
                </div>

                <div className={styles.fileMenu}>
                    <div>
                        <div
                            className={styles.fileMenuButton}
                            onMouseEnter={(e) =>
                                setTooltip({
                                    text: "Spoiler Attachment",
                                    element: e.currentTarget,
                                    gap: 3,
                                })
                            }
                            onMouseLeave={() => setTooltip(null)}
                            onClick={() => {
                                setAttachments((attachments: TAttachment[]) =>
                                    attachments.map((a) =>
                                        a.id === attachment.id
                                            ? {
                                                  ...a,
                                                  name: isSpoiler
                                                      ? a.name.slice(8)
                                                      : `SPOILER_${a.name}`,
                                                  isSpoiler: !isSpoiler,
                                              }
                                            : a
                                    )
                                );
                            }}
                        >
                            <Icon
                                name={isSpoiler ? "eyeSlash" : "eye"}
                                size={20}
                            />
                        </div>

                        <div
                            className={styles.fileMenuButton}
                            onMouseEnter={(e) =>
                                setTooltip({
                                    text: "Modify Attachment",
                                    element: e.currentTarget,
                                    gap: 3,
                                })
                            }
                            onMouseLeave={() => setTooltip(null)}
                            onClick={() => {
                                setTooltip(null);
                                setLayers({
                                    settings: {
                                        type: "POPUP",
                                    },
                                    content: {
                                        type: "FILE_EDIT",
                                        attachment,
                                        handleFileChange,
                                    },
                                });
                            }}
                        >
                            <Icon
                                name="edit"
                                size={20}
                            />
                        </div>

                        <div
                            className={styles.fileMenuButton + " " + styles.danger}
                            onMouseEnter={(e) =>
                                setTooltip({
                                    text: "Remove Attachment",
                                    element: e.currentTarget,
                                    gap: 3,
                                })
                            }
                            onMouseLeave={() => setTooltip(null)}
                            onClick={() => {
                                setAttachments((attachments: TAttachment[]) =>
                                    attachments.filter((a) => a.id !== attachment.id)
                                );
                                setTooltip(null);
                            }}
                        >
                            <Icon
                                name="delete"
                                size={20}
                                fill="var(--error-1)"
                            />
                        </div>
                    </div>
                </div>
            </li>
        );
    }, [attachment, hideSpoiler]);
};
