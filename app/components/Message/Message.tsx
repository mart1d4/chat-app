"use client";

import { useEffect, useState, useMemo, useRef, SetStateAction, Dispatch } from "react";
import { useData, useLayers, useMessages, useTooltip } from "@/lib/store";
import { getFullChannel, sanitizeString } from "@/lib/strings";
import { shouldDisplayInlined } from "@/lib/message";
import useFetchHelper from "@/hooks/useFetchHelper";
import styles from "./Message.module.css";
import Link from "next/link";
import {
    Icon,
    Avatar,
    MessageInvite,
    TextArea,
    MessageMenu,
    UserMention,
    MessageEmbeds,
    MessageAttachments,
} from "@components";
import {
    uploadFileGroup,
    UnknownProgressInfo,
    ComputableProgressInfo,
} from "@uploadcare/upload-client";

type Message = Partial<MessageTable> & {
    reference: Message | null;
    attachments: Attachment[];
    mentions: UserTable[];
    author: UserTable;
    waiting?: boolean;
    error?: boolean;
    needsToBeSent?: boolean;
} & Pick<MessageTable, "id" | "type" | "createdAt" | "edited" | "attachments" | "channelId">;

type Invite = (
    | Partial<InviteTable>
    | {
          code: string;
          type: "error" | "notfound";
      }
)[];

const messageIcons = {
    2: "add-user",
    3: "remove-user",
    7: "pin",
};

export function Message({
    message,
    setMessages,
    large,
    channel,
    guild,
}: {
    message: Message;
    setMessages: Dispatch<SetStateAction<Message[]>>;
    large: boolean;
    channel: Partial<ChannelTable>;
    guild: Partial<GuildTable>;
}) {
    const [fileProgress, setFileProgress] = useState(0);
    const [translation, setTranslation] = useState("");
    const [invites, setInvites] = useState<Invite>([]);

    const moveChannelUp = useData((state) => state.moveChannelUp);
    const setTooltip = useTooltip((state) => state.setTooltip);
    const setLayers = useLayers((state) => state.setLayers);
    const setReply = useMessages((state) => state.setReply);
    const replies = useMessages((state) => state.replies);
    const setEdit = useMessages((state) => state.setEdit);
    const layers = useLayers((state) => state.layers);
    const edits = useMessages((state) => state.edits);
    const user = useData((state) => state.user);
    const { sendRequest } = useFetchHelper();

    const reply = replies.find((r) => r.messageId === message.id);
    const edit = edits.find((e) => e.messageId === message.id);

    const isMentioned = message.mentions?.some((m) => m.id === user.id);

    const controller = useMemo(() => new AbortController(), []);
    const inline = shouldDisplayInlined(message.type);
    const hasRendered = useRef(false);

    const userRegex = /<([@][0-9]{18})>/g;
    const urlRegex = /https?:\/\/[-A-Za-z0-9+&@#/%?=~_|!:,.;]*[-A-Za-z0-9+&@#/%=~_|]/g;
    const inviteRegex =
        /^(https?:\/\/)?(localhost:3000|chat-app\.mart1d4\.dev)\/[a-zA-Z0-9]{8}\/?$/g;

    const translateUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${"fr"}&dt=t&dj=1&source=input&q=`;

    async function translateMessage() {
        if (!message.content) return;
        const contents = [];

        // Split the message into chunks of 2000 characters
        for (let i = 0; i < message.content.length; i += 2000) {
            contents.push(message.content.substring(i, i + 2000));
        }

        const translations = await Promise.all(
            contents.map(async (content) => {
                const response = await fetch(translateUrl + content);
                const data = await response.json();
                return data.sentences.map((sentence: any) => sentence.trans);
            })
        );

        setTranslation(translations.join(""));
    }

    const guildInvites: string[] = [];

    let messageContent: JSX.Element | null = null;
    if (message.content && !inline) {
        messageContent = (
            <span>
                {message.content.split(/(\s+)/).map((part: string, i: number) => {
                    if (userRegex.test(part) && message.mentions?.length) {
                        const userId = part.substring(2).slice(0, -1);
                        const user = message.mentions.find(
                            (u: UserTable) => u.id === parseInt(userId)
                        );

                        if (!user) return part;

                        return (
                            <UserMention
                                key={`${message.id}-${user.id}-${i}`}
                                user={user}
                                full={true}
                            />
                        );
                    } else if (urlRegex.test(part)) {
                        if (inviteRegex.test(part)) {
                            const code = part.substring(part.length - 8);
                            if (!guildInvites.includes(code)) {
                                guildInvites.push(code);
                            }
                        }

                        return (
                            <Link
                                href={part}
                                key={`${message.id}-link-${i}`}
                                target={part.includes("chat-app.mart1d4.dev") ? "_self" : "_blank"}
                                rel="noopener noreferrer"
                                className={styles.messageLink}
                            >
                                {part}
                            </Link>
                        );
                    } else {
                        return part;
                    }
                })}
            </span>
        );
    }

    let referencedContent: JSX.Element | null = null;
    if (message.reference?.content && !inline) {
        referencedContent = (
            <span>
                {message.reference.content.split(/(\s+)/).map((part: string, i: number) => {
                    if (userRegex.test(part) && message.reference?.mentions?.length) {
                        const userId = part.substring(2).slice(0, -1);
                        const user = message.reference.mentions.find(
                            (u: UserTable) => u.id === parseInt(userId)
                        );

                        if (!user) return part;

                        return (
                            <UserMention
                                key={`${message.id}-${user.id}-${i}`}
                                user={user}
                                full={true}
                            />
                        );
                    } else if (urlRegex.test(part)) {
                        return (
                            <span
                                key={`${message.id}-link-${i}`}
                                className={styles.messageLink}
                            >
                                {part}
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
        if (message.waiting || message.needsToBeSent || message.error) return;
        const env = process.env.NODE_ENV;

        async function getInvite(code: string) {
            const response = await sendRequest({
                query: "GET_INVITE",
                params: { inviteId: code },
            });

            if (!response.invite && response.invite !== null) {
                return setInvites((invites) => [...invites, { code: code, type: "error" }]);
            }

            setInvites((invites) => [
                ...invites,
                response.invite === null
                    ? { code: code, type: "notfound" }
                    : {
                          ...response.invite,
                          channel: getFullChannel(response.invite.channel, user),
                      },
            ]);
        }

        if (env === "development" && !hasRendered.current) {
            return () => {
                hasRendered.current = true;
            };
        }

        guildInvites.forEach((code) => {
            getInvite(code);
        });
    }, [message.waiting, message.needsToBeSent, message.error]);

    useEffect(() => {
        if (!edit || edit.messageId !== message.id) return;

        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                e.stopPropagation();
                sendEditedMessage();
            }
        }

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [edit]);

    function deleteLocalMessage() {
        setMessages((messages) => messages.filter((m) => m.id !== message.id));
    }

    async function retrySendMessage(prevMessage: Message) {
        if (
            !prevMessage ||
            (!prevMessage.waiting && !prevMessage.error && !prevMessage.needsToBeSent)
        ) {
            return;
        }

        const tempMessage = {
            id: prevMessage.id,
            content: prevMessage.content,
            attachments: prevMessage.attachments,
            author: prevMessage.author,
            channelId: prevMessage.channelId,
            reference: prevMessage.reference,
            createdAt: new Date(),
            error: false,
            waiting: true,
            needsToBeSent: false,
        };

        deleteLocalMessage();
        setMessages((messages) => [...messages, tempMessage]);

        let uploadedFiles: Attachment[] = [];

        try {
            if (prevMessage.attachments?.length > 0) {
                const onProgress = (props: ComputableProgressInfo | UnknownProgressInfo) => {
                    if ("value" in props) setFileProgress(props.value);
                };

                const filesToAdd = await Promise.all(
                    prevMessage.attachments.map(async (a) => {
                        const response = await fetch(a.url);
                        const blob = await response.blob();
                        const file = new File([blob], a.name, { type: blob.type });
                        return file;
                    })
                );

                await uploadFileGroup(filesToAdd, {
                    publicKey: process.env.NEXT_PUBLIC_CDN_TOKEN as string,
                    store: "auto",
                    onProgress,
                    signal: controller.signal,
                }).then((result) => {
                    uploadedFiles = result.files.map((file, index) => {
                        const attachment = prevMessage.attachments[index];

                        return {
                            ...attachment,
                            id: file.uuid,
                            url: `https://ucarecdn.com/${file.uuid}/`,
                        };
                    });
                });
            }

            const response = await sendRequest({
                query: "SEND_MESSAGE",
                params: { channelId: prevMessage.channelId },
                data: {
                    message: {
                        content: prevMessage.content,
                        attachments: uploadedFiles,
                        reference: prevMessage.reference,
                    },
                },
            });

            if (!response.success) {
                setMessages((prev) =>
                    prev.map((m) =>
                        m.id === prevMessage.id ? { ...m, error: true, waiting: false } : m
                    )
                );

                if (prevMessage.attachments.length > 0) {
                    setLayers({
                        settings: {
                            type: "POPUP",
                        },
                        content: {
                            type: "WARNING",
                            warning: "UPLOAD_FAILED",
                        },
                    });
                }

                return;
            }

            const message = response.data.message;

            setMessages((prev) => prev.map((m) => (m.id === prevMessage.id ? message : m)));
            moveChannelUp(message.channelId);
        } catch (error) {
            console.error(error);

            setMessages((prev) => {
                return prev.map((m) => {
                    return m.id === prevMessage.id ? { ...m, error: true, waiting: false } : m;
                });
            });

            if (prevMessage.attachments.length > 0) {
                controller.abort();
                setLayers({
                    settings: {
                        type: "POPUP",
                    },
                    content: {
                        type: "WARNING",
                        warning: "UPLOAD_FAILED",
                    },
                });
            }
        }
    }

    useEffect(() => {
        if (process.env.NODE_ENV === "development" && !hasRendered.current) {
            return () => {
                hasRendered.current = true;
            };
        }

        if (message.needsToBeSent) retrySendMessage(message);
    }, []);

    function deletePopup() {
        setLayers({
            settings: {
                type: "POPUP",
            },
            content: {
                type: "DELETE_MESSAGE",
                channelId: message.channelId,
                message: message,
            },
        });
    }

    function pinPopup() {
        setLayers({
            settings: {
                type: "POPUP",
            },
            content: {
                type: "PIN_MESSAGE",
                channelId: message.channelId,
                message: message,
            },
        });
    }

    function unpinPopup() {
        setLayers({
            settings: {
                type: "POPUP",
            },
            content: {
                type: "UNPIN_MESSAGE",
                channelId: message.channelId,
                message: message,
            },
        });
    }

    function editMessageState() {
        setEdit(channel.id, message.id, message.content || "");
    }

    async function sendEditedMessage() {
        if (edit?.messageId !== message.id) return;
        const content = sanitizeString(edit?.content || "");

        if (content === message.content) return setEdit(channel.id, null);

        if (!content && message.attachments.length === 0) {
            return setLayers({
                settings: {
                    type: "POPUP",
                },
                content: {
                    type: "DELETE_MESSAGE",
                    channelId: message.channelId,
                    message: message,
                },
            });
        }

        if (content && content.length > 16000) {
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

        try {
            sendRequest({
                query: "UPDATE_MESSAGE",
                params: {
                    channelId: message.channelId,
                    messageId: message.id,
                },
                data: { content: content },
            });

            setEdit(channel.id, null);
        } catch (error) {
            console.error(error);
        }
    }

    function replyToMessageState() {
        setReply(channel.id, message.id, message.author.username);
    }

    function getLongDate(date: Date) {
        return new Intl.DateTimeFormat("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
        }).format(new Date(date));
    }

    function getMidDate(date: Date) {
        return new Intl.DateTimeFormat("en-US", {
            month: "numeric",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "numeric",
        }).format(new Date(date));
    }

    function getShortDate(date: Date) {
        return new Intl.DateTimeFormat("en-US", {
            hour: "numeric",
            minute: "numeric",
        }).format(new Date(date));
    }

    async function removeEmbeds() {
        // const response = await sendRequest({
        //     query: "REMOVE_EMBEDS",
        //     params: { messageId: message.id },
        // });

        console.log("removeEmbeds");
    }

    const functions = {
        deletePopup,
        pinPopup,
        unpinPopup,
        editMessageState,
        replyToMessageState,
        deleteLocalMessage,
        retrySendMessage,
        translateMessage,
        removeEmbeds,
    };

    if (inline) {
        return (
            <li
                className={
                    styles.messageContainer +
                    " " +
                    styles.inlined +
                    " " +
                    (reply?.messageId === message.id ? styles.reply : "")
                }
                onContextMenu={(e) => {
                    e.preventDefault();
                    setLayers({
                        settings: {
                            type: "MENU",
                            event: e,
                        },
                        content: {
                            type: "MESSAGE",
                            message: {
                                ...message,
                                inline: true,
                            },
                            channelType: channel.type,
                            channelOwnerId: channel.ownerId,
                            guildOwnerId: guild?.ownerId,
                            deletePopup,
                            replyToMessageState,
                            translateMessage,
                        },
                    });
                }}
                style={{
                    backgroundColor:
                        layers.MENU?.content.message?.id === message.id
                            ? "var(--background-hover-4)"
                            : "",
                    marginTop: large ? "1.0625rem" : "",
                }}
            >
                <MessageMenu
                    message={message}
                    large={false}
                    functions={functions}
                    channel={channel}
                    guild={guild}
                    inline={inline}
                    show={layers.MENU?.content?.message?.id === message.id}
                    hide={edit?.messageId === message.id}
                />

                <div className={styles.message}>
                    <div className={styles.specialIcon}>
                        <div>
                            <Icon name={messageIcons[message.type]} />
                        </div>
                    </div>

                    <div className={styles.messageContent}>
                        <div
                            style={{
                                whiteSpace: "pre-line",
                                opacity: message.waiting ? 0.5 : 1,
                                color: message.error ? "var(--error-1)" : "",
                            }}
                        >
                            {(message.type === 2 || message.type === 3) && (
                                <span>
                                    <UserMention user={message.author} />{" "}
                                    {message.mentions.length > 0 ? (
                                        <>
                                            {message.type === 2 ? "added " : "removed "}
                                            <UserMention user={message.mentions[0]} />{" "}
                                            {message.type === 2 ? "to " : "from "}the group.{" "}
                                        </>
                                    ) : (
                                        " left the group."
                                    )}
                                </span>
                            )}

                            {message.type === 4 && <span></span>}
                            {message.type === 5 && <span></span>}
                            {message.type === 6 && <span></span>}

                            {message.type === 7 && (
                                <span>
                                    <UserMention user={message.author} /> pinned{" "}
                                    <span
                                        className={styles.inlineMention}
                                        onClick={(e) => {}}
                                    >
                                        a message
                                    </span>{" "}
                                    to this channel. See all{" "}
                                    <span
                                        className={styles.inlineMention}
                                        onClick={(e) => {
                                            setLayers({
                                                settings: {
                                                    type: "POPUP",
                                                    element: e.currentTarget,
                                                    firstSide: "BOTTOM",
                                                    secondSide: "LEFT",
                                                    gap: 10,
                                                },
                                                content: {
                                                    type: "PINNED_MESSAGES",
                                                    channel: channel,
                                                },
                                            });
                                        }}
                                    >
                                        pinned messages
                                    </span>
                                    .{" "}
                                </span>
                            )}

                            {message.type === 8 && <span></span>}

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
                                <span style={{ userSelect: "text" }}>
                                    {getMidDate(message.createdAt)}
                                </span>
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
                    className={`
                        ${styles.messageContainer}
                        ${large ? styles.large : ""}
                        ${reply?.messageId === message.id ? styles.reply : ""}
                        ${isMentioned ? styles.mentioned : ""}
                    `}
                    onContextMenu={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (edit?.messageId === message.id || message.waiting || message.error)
                            return;
                        setLayers({
                            settings: {
                                type: "MENU",
                                event: e,
                            },
                            content: {
                                type: "MESSAGE",
                                message: message,
                                channelType: channel.type,
                                channelOwnerId: channel.ownerId,
                                guildOwnerId: guild?.ownerId,
                                functions: functions,
                            },
                        });
                    }}
                    style={{
                        backgroundColor:
                            layers.MENU?.content?.message?.id === message.id ||
                            edit?.messageId === message.id
                                ? "var(--background-hover-4)"
                                : "",
                    }}
                >
                    <MessageMenu
                        message={message}
                        large={large}
                        functions={functions}
                        channel={channel}
                        guild={guild}
                        inline={inline}
                        show={layers.MENU?.content?.message?.id === message.id}
                        hide={edit?.messageId === message.id}
                    />

                    <div className={styles.message}>
                        {message.type === 1 && (
                            <div className={styles.messageReply}>
                                {message.reference ? (
                                    <div
                                        className={styles.userAvatarReply}
                                        onDoubleClick={(e) => e.stopPropagation()}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (
                                                layers.MENU?.settings.event?.currentTarget ===
                                                e.currentTarget
                                            ) {
                                                setLayers({
                                                    settings: {
                                                        type: "USER_CARD",
                                                        setNull: true,
                                                    },
                                                });
                                            } else {
                                                setLayers({
                                                    settings: {
                                                        type: "USER_CARD",
                                                        element: e.currentTarget,
                                                        firstSide: "RIGHT",
                                                        gap: 10,
                                                    },
                                                    content: {
                                                        user: message.reference.author,
                                                    },
                                                });
                                            }
                                        }}
                                        onContextMenu={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setLayers({
                                                settings: {
                                                    type: "MENU",
                                                    event: e,
                                                },
                                                content: {
                                                    type: "USER",
                                                    user: message.reference.author,
                                                },
                                            });
                                        }}
                                    >
                                        <Avatar
                                            src={message.reference.author.avatar}
                                            alt={message.reference.author.username}
                                            size={16}
                                        />
                                    </div>
                                ) : (
                                    <div className={styles.noReplyBadge}>
                                        <svg
                                            width="12"
                                            height="8"
                                            viewBox="0 0 12 8"
                                        >
                                            <path
                                                d="M0.809739 3.59646L5.12565 0.468433C5.17446 0.431163 5.23323 0.408043 5.2951 0.401763C5.35698 0.395482 5.41943 0.406298 5.4752 0.432954C5.53096 0.45961 5.57776 0.50101 5.61013 0.552343C5.64251 0.603676 5.65914 0.662833 5.6581 0.722939V2.3707C10.3624 2.3707 11.2539 5.52482 11.3991 7.21174C11.4028 7.27916 11.3848 7.34603 11.3474 7.40312C11.3101 7.46021 11.2554 7.50471 11.1908 7.53049C11.1262 7.55626 11.0549 7.56204 10.9868 7.54703C10.9187 7.53201 10.857 7.49695 10.8104 7.44666C8.72224 5.08977 5.6581 5.63359 5.6581 5.63359V7.28135C5.65831 7.34051 5.64141 7.39856 5.60931 7.44894C5.5772 7.49932 5.53117 7.54004 5.4764 7.5665C5.42163 7.59296 5.3603 7.60411 5.29932 7.59869C5.23834 7.59328 5.18014 7.57151 5.13128 7.53585L0.809739 4.40892C0.744492 4.3616 0.691538 4.30026 0.655067 4.22975C0.618596 4.15925 0.599609 4.08151 0.599609 4.00269C0.599609 3.92386 0.618596 3.84612 0.655067 3.77562C0.691538 3.70511 0.744492 3.64377 0.809739 3.59646Z"
                                                fill="currentColor"
                                            />
                                        </svg>
                                    </div>
                                )}

                                {message.reference && (
                                    <span
                                        onDoubleClick={(e) => e.stopPropagation()}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (
                                                layers.USER_CARD?.settings.element ===
                                                e.currentTarget
                                            ) {
                                                setLayers({
                                                    settings: {
                                                        type: "USER_CARD",
                                                        setNull: true,
                                                    },
                                                });
                                            } else {
                                                setLayers({
                                                    settings: {
                                                        type: "USER_CARD",
                                                        element: e.currentTarget,
                                                        firstSide: "RIGHT",
                                                        gap: 10,
                                                    },
                                                    content: {
                                                        user: message.reference.author,
                                                    },
                                                });
                                            }
                                        }}
                                        onContextMenu={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setLayers({
                                                settings: {
                                                    type: "MENU",
                                                    event: e,
                                                },
                                                content: {
                                                    type: "USER",
                                                    user: message.reference.author,
                                                },
                                            });
                                        }}
                                    >
                                        {message.reference.author.displayName}
                                    </span>
                                )}

                                {referencedContent ? (
                                    <div className={styles.referenceContent}>
                                        {referencedContent}{" "}
                                        {message.reference.edited && (
                                            <div className={styles.contentTimestamp}>
                                                <span
                                                    onMouseEnter={(e) =>
                                                        setTooltip({
                                                            text: getLongDate(message.edited),
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
                                        {message.reference.attachments.length > 0
                                            ? "Click to see attachment"
                                            : "Original message was deleted"}
                                    </div>
                                )}

                                {message.reference.attachments.length > 0 && (
                                    <Icon
                                        name="image"
                                        size={20}
                                    />
                                )}
                            </div>
                        )}

                        <div
                            className={styles.messageContent}
                            onDoubleClick={() => {
                                if (message.author.id === user.id) {
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
                                        if (layers.USER_CARD?.settings.element === e.currentTarget)
                                            return setLayers({
                                                settings: {
                                                    type: "USER_CARD",
                                                    setNull: true,
                                                },
                                            });
                                        setLayers({
                                            settings: {
                                                type: "USER_CARD",
                                                element: e.currentTarget,
                                                firstSide: "RIGHT",
                                                gap: 10,
                                            },
                                            content: {
                                                user: message.author,
                                            },
                                        });
                                    }}
                                    onDoubleClick={(e) => e.stopPropagation()}
                                    onContextMenu={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setLayers({
                                            settings: {
                                                type: "MENU",
                                                event: e,
                                            },
                                            content: {
                                                type: "USER",
                                                user: message.author,
                                            },
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
                                            if (
                                                layers.USER_CARD?.settings.element ===
                                                e.currentTarget
                                            ) {
                                                setLayers({
                                                    settings: {
                                                        type: "USER_CARD",
                                                        setNull: true,
                                                    },
                                                });
                                            } else {
                                                setLayers({
                                                    settings: {
                                                        type: "USER_CARD",
                                                        element: e.currentTarget,
                                                        firstSide: "RIGHT",
                                                        gap: 10,
                                                    },
                                                    content: {
                                                        user: message.author,
                                                    },
                                                });
                                            }
                                        }}
                                        onContextMenu={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setLayers({
                                                settings: {
                                                    type: "MENU",
                                                    event: e,
                                                },
                                                content: {
                                                    type: "USER",
                                                    user: message.author,
                                                },
                                            });
                                        }}
                                    >
                                        {message.author?.displayName}
                                    </span>

                                    {message.waiting && (
                                        <span className={styles.titleTimestamp}>Sending...</span>
                                    )}
                                    {message.error && (
                                        <span className={styles.titleTimestamp}>Error Sending</span>
                                    )}

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
                                        visibility:
                                            layers.MENU?.content.message?.id === message.id
                                                ? "visible"
                                                : undefined,
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
                                className={styles.mainContent}
                                style={{
                                    whiteSpace: "pre-line",
                                    opacity:
                                        message.waiting && message?.attachments?.length === 0
                                            ? 0.5
                                            : 1,
                                    color: message.error ? "var(--error-1)" : "",
                                }}
                            >
                                {edit?.messageId === message.id ? (
                                    <>
                                        <TextArea
                                            channel={channel}
                                            editing={true}
                                        />

                                        <div className={styles.editHint}>
                                            escape to{" "}
                                            <span onClick={() => setEdit(channel.id, null)}>
                                                cancel{" "}
                                            </span>
                                            • enter to{" "}
                                            <span onClick={() => sendEditedMessage()}>save </span>
                                        </div>
                                    </>
                                ) : (
                                    messageContent && (
                                        <>
                                            {messageContent}{" "}
                                            {message.edited && message.attachments.length === 0 && (
                                                <div className={styles.contentTimestamp}>
                                                    <span
                                                        onMouseEnter={(e) =>
                                                            setTooltip({
                                                                text: getLongDate(message.edited),
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
                                            {translation && (
                                                <div className={styles.translation}>
                                                    {translation}
                                                    <span onClick={() => setTranslation("")}>
                                                        Dismiss
                                                    </span>
                                                </div>
                                            )}
                                        </>
                                    )
                                )}

                                {message.attachments?.length > 0 &&
                                    !(message.error || message.waiting) && (
                                        <MessageAttachments
                                            message={message}
                                            functions={functions}
                                        />
                                    )}

                                {message.embeds?.length > 0 &&
                                    !(message.error || message.waiting) && (
                                        <MessageEmbeds
                                            message={message}
                                            functions={functions}
                                        />
                                    )}

                                {message.attachments?.length > 0 &&
                                    (message.waiting || message.error) && (
                                        <div className={styles.imagesUpload}>
                                            <img
                                                src="https://ucarecdn.com/81976ed2-ac05-457f-b52d-930c474dcb1d/"
                                                alt="File Upload"
                                            />

                                            <div>
                                                <div>
                                                    {message.error ? (
                                                        <div>Failed uploading files</div>
                                                    ) : (
                                                        <>
                                                            <div>
                                                                {message.attachments.length === 1
                                                                    ? message.attachments[0].name
                                                                    : `${message.attachments.length} files`}
                                                            </div>

                                                            <div>
                                                                —{" "}
                                                                {(
                                                                    message.attachments.reduce(
                                                                        (
                                                                            acc: number,
                                                                            attachment: any
                                                                        ) => acc + attachment.size,
                                                                        0
                                                                    ) / 1000000
                                                                ).toFixed(2)}{" "}
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
                                                                backgroundColor: message.error
                                                                    ? "var(--error-1)"
                                                                    : "",
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div
                                                onClick={() => {
                                                    if (message.error) deleteLocalMessage();
                                                    else controller.abort();
                                                }}
                                            >
                                                <Icon name="close" />
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

                            {invites.length > 0 && (
                                <div className={styles.messageAccessories}>
                                    {invites.map((invite) => (
                                        <MessageInvite
                                            key={invite.code}
                                            invite={invite}
                                            message={message}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </li>
            ),
        [message, edit, reply, layers.MENU, fileProgress, invites, translation]
    );
}
