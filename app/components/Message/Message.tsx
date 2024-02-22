"use client";

import { useEffect, useState, useMemo, useRef, SetStateAction, Dispatch } from "react";
import { useData, useLayers, useMention, useMessages, useTooltip } from "@/lib/store";
import { getFullChannel, sanitizeString } from "@/lib/strings";
import { usePathname, useRouter } from "next/navigation";
import { TextArea, Icon, Avatar } from "@components";
import { shouldDisplayInlined } from "@/lib/message";
import useFetchHelper from "@/hooks/useFetchHelper";
import styles from "./Message.module.css";
import Link from "next/link";
import { v4 } from "uuid";
import {
    ComputableProgressInfo,
    UnknownProgressInfo,
    uploadFileGroup,
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
    const setMention = useMention((state) => state.setMention);
    const setLayers = useLayers((state) => state.setLayers);
    const setReply = useMessages((state) => state.setReply);
    const replies = useMessages((state) => state.replies);
    const setEdit = useMessages((state) => state.setEdit);
    const channels = useData((state) => state.channels);
    const layers = useLayers((state) => state.layers);
    const edits = useMessages((state) => state.edits);
    const guilds = useData((state) => state.guilds);
    const user = useData((state) => state.user);
    const { sendRequest } = useFetchHelper();

    const reply = replies.find((r) => r.messageId === message.id);
    const edit = edits.find((e) => e.messageId === message.id);

    const isMentioned = message.mentions?.some((m) => m.id === user.id);

    const controller = useMemo(() => new AbortController(), []);
    const inline = shouldDisplayInlined(message.type);
    const hasRendered = useRef(false);
    const pathname = usePathname();
    const router = useRouter();

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

        const getInvite = async (code: string) => {
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
                          channel: getFullChannel(
                              response.invite.channel,
                              response.invite.channelId
                          ),
                      },
            ]);
        };

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

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                e.stopPropagation();
                sendEditedMessage();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [edit]);

    const deleteLocalMessage = async () => {
        setMessages((messages) => messages.filter((m) => m.id !== message.id));
    };

    const retrySendMessage = async (prevMessage: Message) => {
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
    };

    useEffect(() => {
        if (process.env.NODE_ENV === "development" && !hasRendered.current) {
            return () => {
                hasRendered.current = true;
            };
        }

        if (message.needsToBeSent) retrySendMessage(message);
    }, []);

    const deletePopup = () => {
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
    };

    const pinPopup = () => {
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
    };

    const unpinPopup = () => {
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
    };

    const editMessageState = () => {
        setEdit(channel.id, message.id, message.content || "");
    };

    const sendEditedMessage = async () => {
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
    };

    const replyToMessageState = () => {
        setReply(channel.id, message.id, message.author.username);
    };

    const getLongDate = (date: Date) => {
        return new Intl.DateTimeFormat("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
        }).format(new Date(date));
    };

    const getMidDate = (date: Date) => {
        return new Intl.DateTimeFormat("en-US", {
            month: "numeric",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "numeric",
        }).format(new Date(date));
    };

    const getShortDate = (date: Date) => {
        return new Intl.DateTimeFormat("en-US", {
            hour: "numeric",
            minute: "numeric",
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
        translateMessage,
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
                                        <div
                                            key={v4()}
                                            className={styles.guildInvite}
                                        >
                                            <h3>
                                                {!("type" in invite)
                                                    ? user.id === invite.inviterId
                                                        ? `You sent an invite to join a ${
                                                              invite.guild ? "server" : "group dm"
                                                          }`
                                                        : `You've been invited to join a ${
                                                              invite.guild ? "server" : "group dm"
                                                          }`
                                                    : user.id === message.author.id
                                                    ? "You sent an invite, but..."
                                                    : "You received an invite, but..."}
                                            </h3>

                                            <div className={styles.content}>
                                                <div className={styles.headline}>
                                                    <div
                                                        className={
                                                            "type" in invite
                                                                ? styles.inviteIconPoop
                                                                : !invite.guild || invite.guild.icon
                                                                ? styles.inviteIcon
                                                                : styles.inviteAcronym
                                                        }
                                                        style={{
                                                            backgroundImage:
                                                                "type" in invite
                                                                    ? "url(https://ucarecdn.com/968c5fbf-9c28-40ae-9bba-7d54d582abe7/)"
                                                                    : invite.guild
                                                                    ? invite.guild.icon &&
                                                                      `url(${process.env.NEXT_PUBLIC_CDN_URL}/${invite.guild.icon}/)`
                                                                    : `url(${process.env.NEXT_PUBLIC_CDN_URL}/${invite.channel.icon}/)`,
                                                        }}
                                                    >
                                                        {!("type" in invite) &&
                                                            invite.guild &&
                                                            !invite.guild?.icon &&
                                                            (invite.guild.name
                                                                .toLowerCase()
                                                                .match(/\b(\w)/g)
                                                                ?.join("") ??
                                                                "")}
                                                    </div>

                                                    <div>
                                                        <h3
                                                            style={{
                                                                color:
                                                                    "type" in invite &&
                                                                    invite.type === "notfound"
                                                                        ? "var(--error-1)"
                                                                        : "",
                                                            }}
                                                            className={
                                                                !("type" in invite) &&
                                                                (guilds.find(
                                                                    (guild) =>
                                                                        guild.id ===
                                                                        invite.guild?.id
                                                                ) ||
                                                                    channels.find(
                                                                        (channel) =>
                                                                            channel.id ===
                                                                            invite.channel.id
                                                                    ))
                                                                    ? styles.link
                                                                    : ""
                                                            }
                                                            onClick={() => {
                                                                if (!("type" in invite)) {
                                                                    if (invite.guild) {
                                                                        if (
                                                                            guilds.find(
                                                                                (guild) =>
                                                                                    guild.id ===
                                                                                    invite.guild?.id
                                                                            )
                                                                        ) {
                                                                            if (
                                                                                pathname !==
                                                                                `/channels/${invite.guild.id}/${invite.channel.id}`
                                                                            ) {
                                                                                router.push(
                                                                                    `/channels/${invite.guild.id}/${invite.channel.id}`
                                                                                );
                                                                            }
                                                                        } else {
                                                                            sendRequest({
                                                                                query: "ACCEPT_INVITE",
                                                                                params: {
                                                                                    inviteId:
                                                                                        invite.code,
                                                                                },
                                                                            });
                                                                        }
                                                                    } else {
                                                                        if (
                                                                            channels.find(
                                                                                (channel) =>
                                                                                    channel.id ===
                                                                                    invite.channelId
                                                                            )
                                                                        ) {
                                                                            if (
                                                                                pathname !==
                                                                                `/channels/me/${invite.channel.id}`
                                                                            ) {
                                                                                router.push(
                                                                                    `/channels/me/${invite.channel.id}`
                                                                                );
                                                                            }
                                                                        } else {
                                                                            sendRequest({
                                                                                query: "ACCEPT_INVITE",
                                                                                params: {
                                                                                    inviteId:
                                                                                        invite.code,
                                                                                },
                                                                            });
                                                                        }
                                                                    }
                                                                }
                                                            }}
                                                        >
                                                            {"type" in invite
                                                                ? invite.type === "notfound"
                                                                    ? "Invalid Invite"
                                                                    : "Something Went Wrong"
                                                                : invite.guild?.name ??
                                                                  invite.channel.name}
                                                        </h3>
                                                        <strong>
                                                            {"type" in invite ? (
                                                                invite.type === "notfound" ? (
                                                                    user.id ===
                                                                    message.author.id ? (
                                                                        "Try sending a new invite!"
                                                                    ) : (
                                                                        `Ask ${message.author.username} for a new invite!`
                                                                    )
                                                                ) : (
                                                                    "Try again later"
                                                                )
                                                            ) : (
                                                                <>
                                                                    <span>
                                                                        <span
                                                                            className={
                                                                                styles.onlineDot
                                                                            }
                                                                        />
                                                                        {invite.guild
                                                                            ? invite.guild
                                                                                  ?.rawMemberIds
                                                                                  .length
                                                                            : invite.channel
                                                                                  .recipients
                                                                                  .length}{" "}
                                                                        Online
                                                                    </span>

                                                                    <span>
                                                                        <span
                                                                            className={
                                                                                styles.offlineDot
                                                                            }
                                                                        />
                                                                        {invite.guild
                                                                            ? invite.guild
                                                                                  ?.rawMemberIds
                                                                                  .length
                                                                            : invite.channel
                                                                                  .recipients
                                                                                  .length}{" "}
                                                                        Member
                                                                        {(invite.guild
                                                                            ? invite.guild
                                                                                  ?.rawMemberIds
                                                                                  .length
                                                                            : invite.channel
                                                                                  .recipients
                                                                                  .length) > 1 &&
                                                                            "s"}
                                                                    </span>
                                                                </>
                                                            )}
                                                        </strong>
                                                    </div>
                                                </div>

                                                {!("type" in invite) && (
                                                    <button
                                                        onClick={() => {
                                                            if (invite.guild) {
                                                                if (
                                                                    guilds.find(
                                                                        (guild) =>
                                                                            guild.id ===
                                                                            invite.guild?.id
                                                                    )
                                                                ) {
                                                                    if (
                                                                        pathname !==
                                                                        `/channels/${invite.guild.id}/${invite.channel.id}`
                                                                    ) {
                                                                        router.push(
                                                                            `/channels/${invite.guild.id}/${invite.channel.id}`
                                                                        );
                                                                    }
                                                                } else {
                                                                    sendRequest({
                                                                        query: "ACCEPT_INVITE",
                                                                        params: {
                                                                            inviteId: invite.code,
                                                                        },
                                                                    });
                                                                }
                                                            } else {
                                                                if (
                                                                    channels.find(
                                                                        (channel) =>
                                                                            channel.id ===
                                                                            invite.channelId
                                                                    )
                                                                ) {
                                                                    if (
                                                                        pathname !==
                                                                        `/channels/me/${invite.channel.id}`
                                                                    ) {
                                                                        router.push(
                                                                            `/channels/me/${invite.channel.id}`
                                                                        );
                                                                    }
                                                                } else {
                                                                    sendRequest({
                                                                        query: "ACCEPT_INVITE",
                                                                        params: {
                                                                            inviteId: invite.code,
                                                                        },
                                                                    });
                                                                }
                                                            }
                                                        }}
                                                        className="button green"
                                                    >
                                                        {guilds.find(
                                                            (guild) => guild.id === invite.guildId
                                                        ) ||
                                                        channels.find(
                                                            (channel) =>
                                                                channel.id === invite.channelId
                                                        )
                                                            ? "Joined"
                                                            : "Join"}
                                                    </button>
                                                )}

                                                {"type" in invite &&
                                                    invite.type === "notfound" &&
                                                    user.id !== message.author.id && (
                                                        <button
                                                            className="button blue"
                                                            onClick={() =>
                                                                setMention(message.author)
                                                            }
                                                        >
                                                            Mention
                                                        </button>
                                                    )}
                                            </div>
                                        </div>
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

export function UserMention({
    user,
    full,
    editor,
}: {
    user: Partial<UserTable>;
    full?: boolean;
    editor?: boolean;
}) {
    const setLayers = useLayers((state) => state.setLayers);
    const layers = useLayers((state) => state.layers);

    return (
        <span
            className={
                full ? `${styles.mention} ${editor ? styles.editor : ""}` : styles.inlineMention
            }
            onClick={(e) => {
                if (layers.USER_CARD?.settings?.element === e.currentTarget || editor) {
                    return;
                }

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

                if (layers.MENU?.settings?.element === e.currentTarget || editor) {
                    return;
                }

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
            {user.username || "Unknown User"}
        </span>
    );
}

function MessageAttachments({ message, functions }: { message: TMessage; functions: any }) {
    const ImageComponent = ({ attachment }) => (
        <Image
            attachment={attachment}
            message={message}
            functions={functions}
        />
    );

    return (
        <div className={styles.attachments}>
            <div>
                {message.attachments.length === 1 && (
                    <div className={styles.gridOneBig}>
                        <ImageComponent
                            key={message.attachments[0].id}
                            attachment={message.attachments[0]}
                        />
                    </div>
                )}

                {message.attachments.length == 2 && (
                    <div className={styles.gridTwo}>
                        {message.attachments.map((attachment) => (
                            <ImageComponent
                                key={attachment.id}
                                attachment={attachment}
                            />
                        ))}
                    </div>
                )}

                {message.attachments.length == 3 && (
                    <div className={styles.gridTwo}>
                        <div className={styles.gridOneSolo}>
                            {message.attachments.slice(0, 1).map((attachment) => (
                                <ImageComponent
                                    key={attachment.id}
                                    attachment={attachment}
                                />
                            ))}
                        </div>

                        <div className={styles.gridTwoColumn}>
                            <div>
                                <div>
                                    {message.attachments.slice(1, 2).map((attachment) => (
                                        <ImageComponent
                                            key={attachment.id}
                                            attachment={attachment}
                                        />
                                    ))}
                                </div>

                                <div>
                                    {message.attachments.slice(2, 3).map((attachment) => (
                                        <ImageComponent
                                            key={attachment.id}
                                            attachment={attachment}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {message.attachments.length == 4 && (
                    <div className={styles.gridFour}>
                        {message.attachments.map((attachment) => (
                            <ImageComponent
                                key={attachment.id}
                                attachment={attachment}
                            />
                        ))}
                    </div>
                )}

                {message.attachments.length == 5 && (
                    <>
                        <div className={styles.gridTwo}>
                            {message.attachments.slice(0, 2).map((attachment) => (
                                <ImageComponent
                                    key={attachment.id}
                                    attachment={attachment}
                                />
                            ))}
                        </div>

                        <div className={styles.gridThree}>
                            {message.attachments.slice(2, 5).map((attachment) => (
                                <ImageComponent
                                    key={attachment.id}
                                    attachment={attachment}
                                />
                            ))}
                        </div>
                    </>
                )}

                {message.attachments.length == 6 && (
                    <div className={styles.gridThree}>
                        {message.attachments.map((attachment) => (
                            <ImageComponent
                                key={attachment.id}
                                attachment={attachment}
                            />
                        ))}
                    </div>
                )}

                {message.attachments.length == 7 && (
                    <>
                        <div className={styles.gridOne}>
                            {message.attachments.slice(0, 1).map((attachment) => (
                                <ImageComponent
                                    key={attachment.id}
                                    attachment={attachment}
                                />
                            ))}
                        </div>

                        <div className={styles.gridThree}>
                            {message.attachments.slice(1, 7).map((attachment) => (
                                <ImageComponent
                                    key={attachment.id}
                                    attachment={attachment}
                                />
                            ))}
                        </div>
                    </>
                )}

                {message.attachments.length == 8 && (
                    <>
                        <div className={styles.gridTwo}>
                            {message.attachments.slice(0, 2).map((attachment) => (
                                <ImageComponent
                                    key={attachment.id}
                                    attachment={attachment}
                                />
                            ))}
                        </div>

                        <div className={styles.gridThree}>
                            {message.attachments.slice(2, 8).map((attachment) => (
                                <ImageComponent attachment={attachment} />
                            ))}
                        </div>
                    </>
                )}

                {message.attachments.length == 9 && (
                    <div className={styles.gridThree}>
                        {message.attachments.map((attachment) => (
                            <ImageComponent
                                key={attachment.id}
                                attachment={attachment}
                            />
                        ))}
                    </div>
                )}

                {message.attachments.length == 10 && (
                    <>
                        <div className={styles.gridOne}>
                            {message.attachments.slice(0, 1).map((attachment) => (
                                <ImageComponent
                                    key={attachment.id}
                                    attachment={attachment}
                                />
                            ))}
                        </div>

                        <div className={styles.gridThree}>
                            {message.attachments.slice(1, 10).map((attachment) => (
                                <ImageComponent
                                    key={attachment.id}
                                    attachment={attachment}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

type MenuProps = {
    message: TMessage;
    large: boolean;
    functions: any;
    channel: TChannel;
    guild?: TGuild | null;
    inline: boolean;
    show: boolean;
    hide: boolean;
};

function MessageMenu({ message, large, functions, channel, guild, inline, show, hide }: MenuProps) {
    const [shift, setShift] = useState(false);

    const setTooltip = useTooltip((state) => state.setTooltip);
    const setLayers = useLayers((state) => state.setLayers);
    const layers = useLayers((state) => state.layers);
    const user = useData((state) => state.user);
    const { sendRequest } = useFetchHelper();

    const menuSender = message.author.id === user.id;

    if (message.waiting || typeof menuSender !== "boolean") return null;

    const writeText = async (text: string) => {
        await navigator.clipboard.writeText(text);
    };

    return (
        <div
            className={styles.buttonContainer}
            style={{ visibility: show ? "visible" : hide ? "hidden" : undefined }}
        >
            <div
                className={styles.buttonWrapper}
                style={{ top: large ? "-16px" : "-25px" }}
            >
                <div className={styles.buttons}>
                    {!message.error ? (
                        <>
                            {shift && !inline && (
                                <>
                                    <div
                                        role="button"
                                        onMouseEnter={(e) => {
                                            setTooltip({
                                                text: "Copy Message ID",
                                                element: e.currentTarget,
                                                gap: 3,
                                            });
                                        }}
                                        onMouseLeave={() => setTooltip(null)}
                                        onClick={() => {
                                            writeText(message.id);
                                        }}
                                    >
                                        <Icon name="id" />
                                    </div>

                                    <div
                                        role="button"
                                        onMouseEnter={(e) => {
                                            setTooltip({
                                                text: `${message.pinned ? "Unpin" : "Pin"} Message`,
                                                element: e.currentTarget,
                                                gap: 3,
                                            });
                                        }}
                                        onMouseLeave={() => setTooltip(null)}
                                        onClick={() => {
                                            sendRequest({
                                                query: message.pinned
                                                    ? "UNPIN_MESSAGE"
                                                    : "PIN_MESSAGE",
                                                params: {
                                                    channelId: message.channelId,
                                                    messageId: message.id,
                                                },
                                            });
                                        }}
                                    >
                                        <Icon name="pin" />
                                    </div>

                                    {message.content && (
                                        <div
                                            role="button"
                                            onMouseEnter={(e) => {
                                                setTooltip({
                                                    text: "Copy Text",
                                                    element: e.currentTarget,
                                                    gap: 3,
                                                });
                                            }}
                                            onMouseLeave={() => setTooltip(null)}
                                            onClick={() => {
                                                writeText(message.content as string);
                                            }}
                                        >
                                            <Icon name="copy" />
                                        </div>
                                    )}

                                    {message.content && (
                                        <div
                                            role="button"
                                            onMouseEnter={(e) => {
                                                setTooltip({
                                                    text: "Translate",
                                                    element: e.currentTarget,
                                                    gap: 3,
                                                });
                                            }}
                                            onMouseLeave={() => setTooltip(null)}
                                            onClick={() => {
                                                functions.translateMessage();
                                            }}
                                        >
                                            <Icon
                                                name="translate"
                                                viewbox="0 96 960 960"
                                            />
                                        </div>
                                    )}

                                    <div
                                        role="button"
                                        onMouseEnter={(e) => {
                                            setTooltip({
                                                text: "Mark Unread",
                                                element: e.currentTarget,
                                                gap: 3,
                                            });
                                        }}
                                        onMouseLeave={() => setTooltip(null)}
                                        onClick={() => {}}
                                    >
                                        <Icon name="mark" />
                                    </div>

                                    <div
                                        role="button"
                                        onMouseEnter={(e) => {
                                            setTooltip({
                                                text: "Copy Message Link",
                                                element: e.currentTarget,
                                                gap: 3,
                                            });
                                        }}
                                        onMouseLeave={() => setTooltip(null)}
                                        onClick={() => {
                                            writeText(
                                                `/channels/@me/${message.channelId}/${message.id}`
                                            );
                                        }}
                                    >
                                        <Icon name="link" />
                                    </div>

                                    {message.content && (
                                        <div
                                            role="button"
                                            onMouseEnter={(e) => {
                                                setTooltip({
                                                    text: "Speak Message",
                                                    element: e.currentTarget,
                                                    gap: 3,
                                                });
                                            }}
                                            onMouseLeave={() => setTooltip(null)}
                                            onClick={() => {
                                                const msg = new SpeechSynthesisUtterance();
                                                msg.text = `${message.author.username} said ${message.content}`;
                                                window.speechSynthesis.speak(msg);
                                            }}
                                        >
                                            <Icon name="speak" />
                                        </div>
                                    )}
                                </>
                            )}

                            {inline && shift && (
                                <>
                                    <div
                                        role="button"
                                        onMouseEnter={(e) => {
                                            setTooltip({
                                                text: "Copy Message ID",
                                                element: e.currentTarget,
                                                gap: 3,
                                            });
                                        }}
                                        onMouseLeave={() => setTooltip(null)}
                                        onClick={() => {
                                            writeText(message.id);
                                        }}
                                    >
                                        <Icon name="id" />
                                    </div>

                                    {message.content && (
                                        <div
                                            role="button"
                                            onMouseEnter={(e) =>
                                                setTooltip({
                                                    text: "Copy Text",
                                                    element: e.currentTarget,
                                                    gap: 3,
                                                })
                                            }
                                            onMouseLeave={() => setTooltip(null)}
                                            onClick={() => {
                                                writeText(message.content as string);
                                            }}
                                        >
                                            <Icon name="copy" />
                                        </div>
                                    )}

                                    <div
                                        role="button"
                                        onMouseEnter={(e) => {
                                            setTooltip({
                                                text: "Mark Unread",
                                                element: e.currentTarget,
                                                gap: 3,
                                            });
                                        }}
                                        onMouseLeave={() => setTooltip(null)}
                                        onClick={() => {}}
                                    >
                                        <Icon name="mark" />
                                    </div>

                                    <div
                                        role="button"
                                        onMouseEnter={(e) => {
                                            setTooltip({
                                                text: "Copy Message Link",
                                                element: e.currentTarget,
                                                gap: 3,
                                            });
                                        }}
                                        onMouseLeave={() => setTooltip(null)}
                                        onClick={() => {
                                            writeText(
                                                `/channels/@me/${message.channelId}/${message.id}`
                                            );
                                        }}
                                    >
                                        <Icon name="link" />
                                    </div>
                                </>
                            )}

                            <div
                                role="button"
                                onMouseEnter={(e) => {
                                    setTooltip({
                                        text: "Add Reaction",
                                        element: e.currentTarget,
                                        gap: 3,
                                    });
                                }}
                                onMouseLeave={() => setTooltip(null)}
                            >
                                <Icon name="addReaction" />
                            </div>

                            {!inline && (
                                <>
                                    {menuSender ? (
                                        <div
                                            role="button"
                                            onMouseEnter={(e) => {
                                                setTooltip({
                                                    text: "Edit",
                                                    element: e.currentTarget,
                                                    gap: 3,
                                                });
                                            }}
                                            onMouseLeave={() => setTooltip(null)}
                                            onClick={() => {
                                                setTooltip(null);
                                                functions.editMessageState();
                                            }}
                                        >
                                            <Icon name="edit" />
                                        </div>
                                    ) : (
                                        <div
                                            role="button"
                                            onMouseEnter={(e) => {
                                                setTooltip({
                                                    text: "Reply",
                                                    element: e.currentTarget,
                                                    gap: 3,
                                                });
                                            }}
                                            onMouseLeave={() => setTooltip(null)}
                                            onClick={() => {
                                                setTooltip(null);
                                                functions.replyToMessageState();
                                            }}
                                        >
                                            <Icon name="reply" />
                                        </div>
                                    )}
                                </>
                            )}

                            {!shift || inline ? (
                                <div
                                    role="button"
                                    onMouseEnter={(e) => {
                                        setTooltip({
                                            text: "More",
                                            element: e.currentTarget,
                                            gap: 3,
                                        });
                                    }}
                                    onMouseLeave={() => setTooltip(null)}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (layers.MENU?.settings.element === e.currentTarget) {
                                            setLayers({
                                                settings: {
                                                    type: "MENU",
                                                    setNull: true,
                                                },
                                            });
                                        } else {
                                            setLayers({
                                                settings: {
                                                    type: "MENU",
                                                    element: e.currentTarget,
                                                    firstSide: "LEFT",
                                                    gap: 5,
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
                                            setTooltip(null);
                                        }
                                    }}
                                >
                                    <Icon name="dots" />
                                </div>
                            ) : (
                                <>
                                    {menuSender ? (
                                        <div
                                            className={styles.red}
                                            role="button"
                                            onMouseEnter={(e) => {
                                                setTooltip({
                                                    text: "Delete",
                                                    element: e.currentTarget,
                                                    gap: 3,
                                                });
                                            }}
                                            onMouseLeave={() => setTooltip(null)}
                                            onClick={() => {
                                                sendRequest({
                                                    query: "DELETE_MESSAGE",
                                                    params: {
                                                        channelId: message.channelId,
                                                        messageId: message.id,
                                                    },
                                                });
                                            }}
                                        >
                                            <Icon name="delete" />
                                        </div>
                                    ) : (
                                        <div
                                            className={styles.red}
                                            role="button"
                                            onMouseEnter={(e) => {
                                                setTooltip({
                                                    text: "Report Message",
                                                    element: e.currentTarget,
                                                    gap: 3,
                                                });
                                            }}
                                            onMouseLeave={() => setTooltip(null)}
                                            onClick={() => {
                                                // functions.reportPopup();
                                            }}
                                        >
                                            <Icon name="report" />
                                        </div>
                                    )}
                                </>
                            )}
                        </>
                    ) : message.waiting ? (
                        <></>
                    ) : (
                        <>
                            <div
                                role="button"
                                onMouseEnter={(e) => {
                                    setTooltip({
                                        text: "Retry",
                                        element: e.currentTarget,
                                        gap: 3,
                                    });
                                }}
                                onMouseLeave={() => setTooltip(null)}
                                onClick={() => {
                                    setTooltip(null);
                                    functions.retrySendMessage(message);
                                }}
                            >
                                <Icon name="retry" />
                            </div>

                            <div
                                role="button"
                                onMouseEnter={(e) => {
                                    setTooltip({
                                        text: "Delete",
                                        element: e.currentTarget,
                                        gap: 3,
                                    });
                                }}
                                onMouseLeave={() => setTooltip(null)}
                                onClick={() => {
                                    setTooltip(null);
                                    functions.deleteLocalMessage();
                                }}
                            >
                                <Icon name="delete" />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

type ImageComponent = {
    attachment: TAttachment;
    message: TMessage;
    functions: any;
};

function Image({ attachment, message, functions }: ImageComponent) {
    const [hideSpoiler, setHideSpoiler] = useState<boolean>(false);
    const [showDelete, setShowDelete] = useState<boolean>(false);

    const setTooltip = useTooltip((state) => state.setTooltip);
    const setLayers = useLayers((state) => state.setLayers);
    const user = useData((state) => state.user);

    return useMemo(
        () => (
            <div
                className={styles.image}
                onMouseEnter={() => {
                    if (user.id !== message.author.id) return;
                    setShowDelete(true);
                }}
                onMouseLeave={() => {
                    if (user.id !== message.author.id) return;
                    setShowDelete(false);
                }}
                onClick={() => {
                    if (attachment.isSpoiler && !hideSpoiler) {
                        return setHideSpoiler(true);
                    }

                    const index = message.attachments.findIndex((a) => a.id === attachment.id);

                    setLayers({
                        settings: {
                            type: "POPUP",
                        },
                        content: {
                            type: "ATTACHMENT_PREVIEW",
                            attachments: message.attachments,
                            current: index,
                        },
                    });
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
                            type: "MESSAGE",
                            message: message,
                            attachment: attachment,
                            functions: functions,
                        },
                    });
                }}
            >
                <div>
                    <div>
                        <div>
                            <div>
                                <img
                                    src={`${process.env.NEXT_PUBLIC_CDN_URL}${
                                        attachment.id
                                    }/-/resize/x${
                                        attachment.dimensions?.height >= 350
                                            ? 350
                                            : attachment.dimensions?.height
                                    }/-/format/webp/`}
                                    alt={attachment.name}
                                    style={{
                                        filter:
                                            attachment.isSpoiler && !hideSpoiler
                                                ? "blur(44px)"
                                                : "none",
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
                                text: "Delete",
                                element: e.currentTarget,
                                gap: 2,
                            })
                        }
                        onMouseLeave={() => setTooltip(null)}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (user.id !== message.author.id) return;

                            if (message.attachments.length === 1 && !message.content) {
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

                            const updatedAttachments = message.attachments
                                .map((file) => file.id)
                                .filter((id: string) => id !== attachment.id);

                            setLayers({
                                settings: {
                                    type: "POPUP",
                                },
                                content: {
                                    type: "DELETE_ATTACHMENT",
                                    message: message,
                                    attachments: updatedAttachments,
                                },
                            });
                        }}
                    >
                        <Icon
                            name="delete"
                            size={20}
                        />
                    </div>
                )}

                {attachment.isSpoiler && !hideSpoiler && (
                    <div className={styles.spoilerButton}>Spoiler</div>
                )}
                {attachment?.description && (!attachment.isSpoiler || hideSpoiler) && (
                    <button
                        className={styles.imageAlt}
                        onMouseEnter={(e) => {
                            if (!attachment.description) return;
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
}
