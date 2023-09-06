"use client";

import { ComputableProgressInfo, UnknownProgressInfo, uploadFileGroup } from "@uploadcare/upload-client";
import { useData, useLayers, useMessages, useTooltip } from "@/lib/store";
import { useEffect, useState, useMemo, useRef } from "react";
import { TextArea, Icon, Avatar } from "@components";
import { shouldDisplayInlined } from "@/lib/message";
import useFetchHelper from "@/hooks/useFetchHelper";
import { trimMessage } from "@/lib/strings";
import styles from "./Message.module.css";
import { v4 } from "uuid";

type Props = {
    message: TMessage;
    setMessages: React.Dispatch<React.SetStateAction<TMessage[]>>;
    large: boolean;
    channel: TChannel;
    guild?: TGuild;
};

export const Message = ({ message, setMessages, large, channel, guild }: Props) => {
    const [fileProgress, setFileProgress] = useState<number>(0);

    const setTooltip = useTooltip((state) => state.setTooltip);
    const user = useData((state) => state.user) as TCleanUser;
    const setLayers = useLayers((state) => state.setLayers);
    const setReply = useMessages((state) => state.setReply);
    const replies = useMessages((state) => state.replies);
    const setEdit = useMessages((state) => state.setEdit);
    const layers = useLayers((state) => state.layers);
    const edits = useMessages((state) => state.edits);
    const { sendRequest } = useFetchHelper();

    const reply = replies.find((r) => r.messageId === message.id);
    const edit = edits.find((e) => e.messageId === message.id);

    const controller = useMemo(() => new AbortController(), []);
    const inline = shouldDisplayInlined(message.type);
    const hasRendered = useRef(false);

    const userRegex: RegExp = /<([@][a-zA-Z0-9]{24})>/g;

    let messageContent: JSX.Element | null = null;
    if (message.content && !inline) {
        messageContent = (
            <span>
                {message.content.split(userRegex).map((part) => {
                    if (message.mentionIds?.includes(part.substring(1))) {
                        const user = message.mentions.find((user) => user.id === part.substring(1)) as TCleanUser;
                        return (
                            <UserMention
                                key={v4()}
                                user={user}
                                full={true}
                            />
                        );
                    } else {
                        return part;
                    }
                })}
            </span>
        );
    }

    let referencedContent: JSX.Element | null = null;
    if (message.messageReference?.content && !inline) {
        referencedContent = (
            <span>
                {message.messageReference?.content.split(userRegex).map((part, index) => {
                    if (message.messageReference.mentionIds?.includes(part.substring(1))) {
                        const user = message.messageReference.mentions?.find(
                            (user) => user.id === part.substring(1)
                        ) as TCleanUser;
                        return (
                            <UserMention
                                key={v4()}
                                user={user}
                                full={true}
                            />
                        );
                    } else {
                        return part;
                    }
                })}
            </span>
        );
    }

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Enter" && !e.shiftKey) {
                if (!edit || edit?.messageId !== message.id) return;
                e.preventDefault();
                e.stopPropagation();
                sendEditedMessage();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [edit]);

    const deleteLocalMessage = async () => {
        setMessages((messages) => messages.filter((m) => m.id !== message.id));
    };

    const retrySendMessage = async (prevMessage: TMessage) => {
        if (!prevMessage || (!prevMessage.waiting && !prevMessage.error && !prevMessage.needsToBeSent)) return;

        const tempMessage = {
            id: prevMessage.id,
            content: prevMessage.content,
            attachments: prevMessage.attachments,
            author: prevMessage.author,
            channelId: prevMessage.channelId,
            messageReference: prevMessage.messageReference,
            createdAt: new Date(),
            error: false,
            waiting: true,
            needsToBeSent: false,
        } as TMessage;

        deleteLocalMessage();
        setMessages((messages: TMessage[]) => [...messages, tempMessage]);

        let uploadedFiles: any = [];

        try {
            if (prevMessage.attachments.length > 0) {
                const onProgress = (props: ComputableProgressInfo | UnknownProgressInfo) => {
                    if ("value" in props) setFileProgress(props.value);
                };

                const filesToAdd = await Promise.all(
                    prevMessage.attachments.map(async (a) => {
                        // a.url is a blob, so we need to convert it to a file
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
                        return {
                            id: file.uuid,
                            url: `https://ucarecdn.com/${file.uuid}/`,
                            name: prevMessage.attachments[index].name,
                            dimensions: prevMessage.attachments[index].dimensions,
                            size: prevMessage.attachments[index].size,
                            isSpoiler: prevMessage.attachments[index].isSpoiler,
                            isImage: prevMessage.attachments[index].isImage,
                            description: prevMessage.attachments[index].description,
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
                        messageReference: prevMessage.messageReference,
                    },
                },
            });

            if (!response.success) {
                setMessages((prev: TMessage[]) => {
                    return prev.map((message) =>
                        message.id === prevMessage.id ? { ...message, error: true, waiting: false } : message
                    );
                });

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

            setMessages((messages: TMessage[]) => messages.filter((message) => message.id !== prevMessage.id));
            setMessages((messages: TMessage[]) => [...messages, message]);
        } catch (error) {
            console.error(error);
            setMessages((messages) => {
                return messages.map((message) => {
                    return message.id === prevMessage.id ? { ...message, error: true, waiting: false } : message;
                });
            });

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
        }
    };

    useEffect(() => {
        const env = process.env.NODE_ENV;

        if (env == "development") {
            if (message?.needsToBeSent && hasRendered.current) {
                retrySendMessage(message);
            }

            return () => {
                hasRendered.current = true;
            };
        } else if (env == "production") {
            if (message?.needsToBeSent) {
                retrySendMessage(message);
            }
        }
    }, []);

    const setLocalStorage = (data: {}) => {
        localStorage.setItem(
            `channel-${message.channelId}`,
            JSON.stringify({
                ...JSON.parse(localStorage.getItem(`channel-${message.channelId}`) || "{}"),
                ...data,
            })
        );
    };

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

    const editMessageState = async () => {
        setEdit(channel.id, message.id, message.content || "");
    };

    const sendEditedMessage = async () => {
        if (edit?.messageId !== message.id) return;
        const content = trimMessage(edit?.content || "");

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

        if (content && content.length > 4000) {
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
        console.log(message.author.username);
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
    };

    const messageIcons = [
        "",
        "",
        "834fd250-08b6-4009-be66-284b1e593abd",
        "a03e8741-1662-46ba-9870-839c54a5d7f0",
        "Call",
        "979c692b-3889-48b5-81e3-a2fe80f42bad",
        "979c692b-3889-48b5-81e3-a2fe80f42bad",
        "938d46b0-fd11-411e-a891-42571825cd11",
        "834fd250-08b6-4009-be66-284b1e593abd",
    ];

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
                        },
                    });
                }}
                style={{
                    backgroundColor: layers.MENU?.content.message?.id === message.id ? "var(--background-hover-4)" : "",
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
                />

                <div className={styles.message}>
                    <div className={styles.specialIcon}>
                        <div
                            style={{
                                backgroundImage: `url(https://ucarecdn.com/${messageIcons[message.type]}/)`,
                                width: "1rem",
                                height: "1rem",
                                backgroundSize: "1rem 1rem",
                                backgroundRepeat: "no-repeat",
                            }}
                        />
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
                                <span style={{ userSelect: "text" }}>{getMidDate(message.createdAt)}</span>
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
                    className={
                        styles.messageContainer +
                        " " +
                        (large ? styles.large : "") +
                        " " +
                        (reply?.messageId === message.id ? styles.reply : "")
                    }
                    onContextMenu={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (edit?.messageId === message.id || message.waiting || message.error) return;
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
                            layers.MENU?.content?.message?.id === message.id ? "var(--background-hover-4)" : "",
                    }}
                >
                    <MessageMenu
                        message={message}
                        large={large}
                        functions={functions}
                        channel={channel}
                        guild={guild}
                        inline={inline}
                    />

                    <div className={styles.message}>
                        {message.type === 1 && (
                            <div className={styles.messageReply}>
                                {message.messageReference ? (
                                    <div
                                        className={styles.userAvatarReply}
                                        onDoubleClick={(e) => e.stopPropagation()}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (!message.messageReference) return;
                                            if (layers.MENU?.settings.event?.currentTarget === e.currentTarget) {
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
                                                        user: message.messageReference?.author,
                                                    },
                                                });
                                            }
                                        }}
                                        onContextMenu={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            if (!message.messageReference) return;
                                            setLayers({
                                                settings: {
                                                    type: "MENU",
                                                    event: e,
                                                },
                                                content: {
                                                    type: "USER",
                                                    user: message.messageReference?.author,
                                                },
                                            });
                                        }}
                                    >
                                        <Avatar
                                            src={message.messageReference?.author.avatar}
                                            alt={message.messageReference?.author.username}
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

                                {message.messageReference && (
                                    <span
                                        onDoubleClick={(e) => e.stopPropagation()}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (layers.USER_CARD?.settings.element === e.currentTarget) {
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
                                                        user: message.messageReference.author,
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
                                                    user: message.messageReference.author,
                                                },
                                            });
                                        }}
                                    >
                                        {message.messageReference.author.displayName}
                                    </span>
                                )}

                                {referencedContent ? (
                                    <div className={styles.referenceContent}>
                                        {referencedContent}{" "}
                                        {message.messageReference.edited && (
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
                                ) : (
                                    <div className={styles.italic}>
                                        {message.messageReference?.attachments.length > 0
                                            ? "Click to see attachment"
                                            : "Original message was deleted"}
                                    </div>
                                )}

                                {message.messageReference?.attachments?.length > 0 && (
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
                                            if (layers.USER_CARD?.settings.element === e.currentTarget) {
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

                                    {message.waiting && <span className={styles.titleTimestamp}>Sending...</span>}
                                    {message.error && <span className={styles.titleTimestamp}>Error Sending</span>}

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
                                            layers.MENU?.content.message?.id === message.id ? "visible" : undefined,
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
                                style={{
                                    whiteSpace: "pre-line",
                                    opacity: message.waiting && message?.attachments?.length === 0 ? 0.5 : 1,
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
                                            escape to <span onClick={() => setEdit(channel.id, null)}>cancel </span>•
                                            enter to <span onClick={() => sendEditedMessage()}>save </span>
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
                                        </>
                                    )
                                )}

                                {message.attachments.length > 0 && !(message.error || message.waiting) && (
                                    <MessageAttachments
                                        message={message}
                                        functions={functions}
                                    />
                                )}

                                {message.attachments.length > 0 && (message.waiting || message.error) && (
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
                                                                    (acc: number, attachment: any) =>
                                                                        acc + attachment.size,
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
                                                            backgroundColor: message.error ? "var(--error-1)" : "",
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
                        </div>
                    </div>
                </li>
            ),
        [message, edit, reply, layers.MENU, fileProgress]
    );
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

const MessageAttachments = ({ message, functions }: any) => {
    const ImageComponent = ({ attachment }: { attachment: TAttachment }) => (
        <Image
            attachment={attachment}
            message={message}
            functions={functions}
        />
    );

    return (
        <div className={styles.attachments}>
            <div>
                {message.attachments.length === 1 &&
                    message.attachments.slice(0, 1).map((attachment: TAttachment) => (
                        <div
                            key={attachment.id}
                            className={styles.gridOneBig}
                        >
                            <ImageComponent attachment={attachment} />
                        </div>
                    ))}

                {message.attachments.length == 2 && (
                    <div className={styles.gridTwo}>
                        {message.attachments.slice(0, 2).map((attachment: TAttachment) => (
                            <ImageComponent attachment={attachment} />
                        ))}
                    </div>
                )}

                {message.attachments.length == 3 && (
                    <div className={styles.gridTwo}>
                        <div className={styles.gridOneSolo}>
                            {message.attachments.slice(0, 1).map((attachment: TAttachment) => (
                                <ImageComponent attachment={attachment} />
                            ))}
                        </div>

                        <div className={styles.gridTwoColumn}>
                            <div>
                                <div>
                                    {message.attachments.slice(1, 2).map((attachment: TAttachment) => (
                                        <ImageComponent attachment={attachment} />
                                    ))}
                                </div>

                                <div>
                                    {message.attachments.slice(2, 3).map((attachment: TAttachment) => (
                                        <ImageComponent attachment={attachment} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {message.attachments.length == 4 && (
                    <div className={styles.gridFour}>
                        {message.attachments.slice(0, 4).map((attachment: TAttachment) => (
                            <ImageComponent attachment={attachment} />
                        ))}
                    </div>
                )}

                {message.attachments.length == 5 && (
                    <>
                        <div className={styles.gridTwo}>
                            {message.attachments.slice(0, 2).map((attachment: TAttachment) => (
                                <ImageComponent attachment={attachment} />
                            ))}
                        </div>

                        <div className={styles.gridThree}>
                            {message.attachments.slice(2, 5).map((attachment: TAttachment) => (
                                <ImageComponent attachment={attachment} />
                            ))}
                        </div>
                    </>
                )}

                {message.attachments.length == 6 && (
                    <div className={styles.gridThree}>
                        {message.attachments.slice(0, 6).map((attachment: TAttachment) => (
                            <ImageComponent attachment={attachment} />
                        ))}
                    </div>
                )}

                {message.attachments.length == 7 && (
                    <>
                        <div className={styles.gridOne}>
                            {message.attachments.slice(0, 1).map((attachment: TAttachment) => (
                                <ImageComponent attachment={attachment} />
                            ))}
                        </div>

                        <div className={styles.gridThree}>
                            {message.attachments.slice(1, 7).map((attachment: TAttachment) => (
                                <ImageComponent attachment={attachment} />
                            ))}
                        </div>
                    </>
                )}

                {message.attachments.length == 8 && (
                    <>
                        <div className={styles.gridTwo}>
                            {message.attachments.slice(0, 2).map((attachment: TAttachment) => (
                                <ImageComponent attachment={attachment} />
                            ))}
                        </div>

                        <div className={styles.gridThree}>
                            {message.attachments.slice(2, 8).map((attachment: TAttachment) => (
                                <ImageComponent attachment={attachment} />
                            ))}
                        </div>
                    </>
                )}

                {message.attachments.length == 9 && (
                    <div className={styles.gridThree}>
                        {message.attachments.slice(0, 9).map((attachment: TAttachment) => (
                            <ImageComponent attachment={attachment} />
                        ))}
                    </div>
                )}

                {message.attachments.length == 10 && (
                    <>
                        <div className={styles.gridOne}>
                            {message.attachments.slice(0, 1).map((attachment: TAttachment) => (
                                <ImageComponent attachment={attachment} />
                            ))}
                        </div>

                        <div className={styles.gridThree}>
                            {message.attachments.slice(1, 10).map((attachment: TAttachment) => (
                                <ImageComponent attachment={attachment} />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

type MenuProps = {
    message: TMessage;
    large: boolean;
    functions: any;
    channel: TChannel;
    guild?: TGuild | null;
    inline: boolean;
};

const MessageMenu = ({ message, large, functions, channel, guild, inline }: MenuProps) => {
    const [menuSender, setMenuSender] = useState<boolean | null>(null);
    const [shift, setShift] = useState<boolean>(false);

    const setTooltip = useTooltip((state) => state.setTooltip);
    const user = useData((state) => state.user) as TCleanUser;
    const setLayers = useLayers((state) => state.setLayers);
    const setEdit = useMessages((state) => state.setEdit);
    const layers = useLayers((state) => state.layers);
    const { sendRequest } = useFetchHelper();

    useEffect(() => {
        setMenuSender(message.author.id === user.id);
    }, [message]);

    useEffect(() => {
        const handleShift = (e: KeyboardEvent) => {
            if (e.key === "Shift") setShift(true);
        };

        const handleShiftUp = (e: KeyboardEvent) => {
            if (e.key === "Shift") setShift(false);
        };

        document.addEventListener("keydown", handleShift);
        document.addEventListener("keyup", handleShiftUp);

        return () => {
            document.removeEventListener("keydown", handleShift);
            document.removeEventListener("keyup", handleShiftUp);
        };
    }, []);

    if (message.waiting || typeof menuSender !== "boolean") return null;

    const writeText = async (text: string) => {
        await navigator.clipboard.writeText(text);
    };

    return (
        <div
            className={styles.buttonContainer}
            style={{
                visibility: layers.MENU?.content.message?.id === message?.id ? "visible" : undefined,
            }}
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
                                        onMouseEnter={(e) =>
                                            setTooltip({
                                                text: "Copy Message ID",
                                                element: e.currentTarget,
                                                gap: 3,
                                            })
                                        }
                                        onMouseLeave={() => setTooltip(null)}
                                        onClick={() => {
                                            writeText(message.id);
                                        }}
                                    >
                                        <Icon name="id" />
                                    </div>

                                    <div
                                        role="button"
                                        onMouseEnter={(e) =>
                                            setTooltip({
                                                text: `${message.pinned ? "Unpin" : "Pin"} Message`,
                                                element: e.currentTarget,
                                                gap: 3,
                                            })
                                        }
                                        onMouseLeave={() => setTooltip(null)}
                                        onClick={() => {
                                            message.pinned
                                                ? () => {
                                                      sendRequest({
                                                          query: "UNPIN_MESSAGE",
                                                          params: {
                                                              channelId: message.channelId,
                                                              messageId: message.id,
                                                          },
                                                      });
                                                  }
                                                : () => {
                                                      sendRequest({
                                                          query: "PIN_MESSAGE",
                                                          params: {
                                                              channelId: message.channelId,
                                                              messageId: message.id,
                                                          },
                                                      });
                                                  };
                                        }}
                                    >
                                        <Icon name="pin" />
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
                                        onMouseEnter={(e) =>
                                            setTooltip({
                                                text: "Translate",
                                                element: e.currentTarget,
                                                gap: 3,
                                            })
                                        }
                                        onMouseLeave={() => setTooltip(null)}
                                        onClick={() => {}}
                                    >
                                        <Icon
                                            name="translate"
                                            viewbox="0 96 960 960"
                                        />
                                    </div>

                                    <div
                                        role="button"
                                        onMouseEnter={(e) =>
                                            setTooltip({
                                                text: "Mark Unread",
                                                element: e.currentTarget,
                                                gap: 3,
                                            })
                                        }
                                        onMouseLeave={() => setTooltip(null)}
                                        onClick={() => {}}
                                    >
                                        <Icon name="mark" />
                                    </div>

                                    <div
                                        role="button"
                                        onMouseEnter={(e) =>
                                            setTooltip({
                                                text: "Copy Message Link",
                                                element: e.currentTarget,
                                                gap: 3,
                                            })
                                        }
                                        onMouseLeave={() => setTooltip(null)}
                                        onClick={() => {
                                            writeText(`/channels/@me/${message.channelId}/${message.id}`);
                                        }}
                                    >
                                        <Icon name="link" />
                                    </div>

                                    {message.content && (
                                        <div
                                            role="button"
                                            onMouseEnter={(e) =>
                                                setTooltip({
                                                    text: "Speak Message",
                                                    element: e.currentTarget,
                                                    gap: 3,
                                                })
                                            }
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
                                        onMouseEnter={(e) =>
                                            setTooltip({
                                                text: "Copy Message ID",
                                                element: e.currentTarget,
                                                gap: 3,
                                            })
                                        }
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
                                        onMouseEnter={(e) =>
                                            setTooltip({
                                                text: "Mark Unread",
                                                element: e.currentTarget,
                                                gap: 3,
                                            })
                                        }
                                        onMouseLeave={() => setTooltip(null)}
                                        onClick={() => {}}
                                    >
                                        <Icon name="mark" />
                                    </div>

                                    <div
                                        role="button"
                                        onMouseEnter={(e) =>
                                            setTooltip({
                                                text: "Copy Message Link",
                                                element: e.currentTarget,
                                                gap: 3,
                                            })
                                        }
                                        onMouseLeave={() => setTooltip(null)}
                                        onClick={() => {
                                            writeText(`/channels/@me/${message.channelId}/${message.id}`);
                                        }}
                                    >
                                        <Icon name="link" />
                                    </div>
                                </>
                            )}

                            <div
                                role="button"
                                onMouseEnter={(e) =>
                                    setTooltip({
                                        text: "Add Reaction",
                                        element: e.currentTarget,
                                        gap: 3,
                                    })
                                }
                                onMouseLeave={() => setTooltip(null)}
                            >
                                <Icon name="addReaction" />
                            </div>

                            {!inline && (
                                <>
                                    {menuSender ? (
                                        <div
                                            role="button"
                                            onMouseEnter={(e) =>
                                                setTooltip({
                                                    text: "Edit",
                                                    element: e.currentTarget,
                                                    gap: 3,
                                                })
                                            }
                                            onMouseLeave={() => setTooltip(null)}
                                            onClick={() => {
                                                setTooltip(null);
                                                setEdit(message.channelId, message.id, message.content || "");
                                            }}
                                        >
                                            <Icon name="edit" />
                                        </div>
                                    ) : (
                                        <div
                                            role="button"
                                            onMouseEnter={(e) =>
                                                setTooltip({
                                                    text: "Reply",
                                                    element: e.currentTarget,
                                                    gap: 3,
                                                })
                                            }
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
                                    onMouseEnter={(e) =>
                                        setTooltip({
                                            text: "More",
                                            element: e.currentTarget,
                                            gap: 3,
                                        })
                                    }
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
                                            onMouseEnter={(e) =>
                                                setTooltip({
                                                    text: "Delete",
                                                    element: e.currentTarget,
                                                    gap: 3,
                                                })
                                            }
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
                                            onMouseEnter={(e) =>
                                                setTooltip({
                                                    text: "Report Message",
                                                    element: e.currentTarget,
                                                    gap: 3,
                                                })
                                            }
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
                                onMouseEnter={(e) =>
                                    setTooltip({
                                        text: "Retry",
                                        element: e.currentTarget,
                                        gap: 3,
                                    })
                                }
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
                                onMouseEnter={(e) =>
                                    setTooltip({
                                        text: "Delete",
                                        element: e.currentTarget,
                                        gap: 3,
                                    })
                                }
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
};

type ImageComponent = {
    attachment: TAttachment;
    message: TMessage;
    functions: any;
};

const Image = ({ attachment, message, functions }: ImageComponent) => {
    const [hideSpoiler, setHideSpoiler] = useState<boolean>(false);
    const [showDelete, setShowDelete] = useState<boolean>(false);

    const setTooltip = useTooltip((state) => state.setTooltip);
    const user = useData((state) => state.user) as TCleanUser;
    const setLayers = useLayers((state) => state.setLayers);

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
                                    src={`${process.env.NEXT_PUBLIC_CDN_URL}${attachment.id}/-/resize/x${
                                        attachment.dimensions.height >= 350 ? 350 : attachment.dimensions.height
                                    }/-/format/webp/`}
                                    alt={attachment?.name}
                                    style={{
                                        filter: attachment.isSpoiler && !hideSpoiler ? "blur(44px)" : "none",
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

                {attachment.isSpoiler && !hideSpoiler && <div className={styles.spoilerButton}>Spoiler</div>}
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
};
