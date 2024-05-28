"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "../Layers/Tooltip/Tooltip";
import { getLongDate, getMidDate, getShortDate } from "@/lib/time";
import type { Channel, Guild, Invite, Message } from "@/type";
import { useData, useLayers, useMessages } from "@/store";
import useFetchHelper from "@/hooks/useFetchHelper";
import { translateString } from "@/lib/helpers";
import { sanitizeString } from "@/lib/strings";
import styles from "./Message.module.css";
import { useState, useMemo } from "react";
import { isInline } from "@/lib/message";
import { FormatMessage } from "./Format";

import {
    MessageAttachments,
    MessageInvite,
    MessageEmbeds,
    MessageMenu,
    UserMention,
    TextArea,
    Avatar,
    Icon,
} from "@components";

let sending = false;

const messageIcons = {
    2: "user-channel-joined",
    3: "user-channel-left",
    4: "channel-update",
    7: "message-pin",
};

export function Message({
    message,
    setMessages,
    large,
    channel,
    guild,
}: {
    message: Message;
    setMessages: (type: "add" | "update" | "delete", messageId: number, message?: Message) => void;
    large: boolean;
    channel: Channel;
    guild?: Guild;
}) {
    const [invites, setInvites] = useState<Invite[]>([]);
    const [fileProgress, setFileProgress] = useState(0);
    const [translation, setTranslation] = useState("");
    const [content, setMessageContent] = useState<JSX.Element | null>(null);
    const [contentRef, setReferenceContent] = useState<JSX.Element | null>(null);

    const moveChannelUp = useData((state) => state.moveChannelUp);
    const setLayers = useLayers((state) => state.setLayers);
    const setReply = useMessages((state) => state.setReply);
    const replies = useMessages((state) => state.replies);
    const setEdit = useMessages((state) => state.setEdit);
    const layers = useLayers((state) => state.layers);
    const edits = useMessages((state) => state.edits);
    const user = useData((state) => state.user);
    const { sendRequest } = useFetchHelper();

    const isMentioned = message.userMentions?.some((m) => m.id === user?.id);
    const reply = replies.find((r) => r.messageId === message.id);
    const edit = edits.find((e) => e.messageId === message.id);

    const isMenuOpen = layers.MENU?.content?.message?.id === message.id;
    const controller = useMemo(() => new AbortController(), []);
    const hasAttachments = message.attachments?.length > 0;
    const isEditing = edit?.messageId === message.id;
    const isReply = reply?.messageId === message.id;
    const hasEmbeds = message.embeds?.length > 0;
    const inline = isInline(message.type);

    if (message.content && !inline && content === null) {
        setMessageContent(FormatMessage({ message: message }));
    }

    if (message.reference?.content && contentRef === null) {
        setReferenceContent(FormatMessage({ message: message.reference }));
    }

    if (message.send) {
        sendMessage();
    }

    async function sendMessage() {
        if (sending) return;
        sending = true;

        try {
            const response = await sendRequest({
                query: "SEND_MESSAGE",
                params: { channelId: message.channelId },
                body: {
                    message: {
                        content: message.content,
                        attachments: [],
                        reference: message.reference,
                    },
                },
            });

            if (!response.errors) {
                const newMessage = response.message;

                setMessages("update", message.id, newMessage);
                moveChannelUp(newMessage.channelId);
            } else {
                setMessages("update", message.id, { ...message, error: true, send: false });

                if (message.attachments.length > 0) {
                    setLayers({
                        settings: { type: "POPUP" },
                        content: {
                            type: "WARNING",
                            warning: "UPLOAD_FAILED",
                        },
                    });
                }
            }
        } catch (error) {
            console.error(error);

            setMessages("update", message.id, { ...message, error: true, send: false });

            if (message.attachments.length > 0) {
                setLayers({
                    settings: { type: "POPUP" },
                    content: {
                        type: "WARNING",
                        warning: "UPLOAD_FAILED",
                    },
                });
            }
        }

        sending = false;
    }

    async function editSubmit(str: string) {
        const content = sanitizeString(str);

        if (content === message.content) {
            return setEdit(message.id, null);
        }

        if (!content && !hasAttachments) {
            return popup("DELETE_MESSAGE");
        }

        if (content.length > 16000) {
            return setLayers({
                settings: { type: "POPUP" },
                content: {
                    type: "WARNING",
                    warning: "MESSAGE_LIMIT",
                },
            });
        }

        try {
            await sendRequest({
                query: "UPDATE_MESSAGE",
                params: {
                    channelId: message.channelId,
                    messageId: message.id,
                },
                body: { content },
            });

            setEdit(channel.id, null);
        } catch (error) {
            console.error(error);
        }
    }

    function popup(type: "DELETE_MESSAGE" | "PIN_MESSAGE" | "UNPIN_MESSAGE") {
        setLayers({
            settings: { type: "POPUP" },
            content: {
                type: type,
                channelId: message.channelId,
                message: message,
            },
        });
    }

    function deleteLocal() {
        setMessages("delete", message.id);
    }

    function editState() {
        setEdit(message.id, message.content || null);
    }

    function replyState() {
        setReply(channel.id, message.id, message.author.displayName);
    }

    async function deleteMessage() {
        try {
            const response = await sendRequest({
                query: "DELETE_MESSAGE",
                params: {
                    channelId: message.channelId,
                    messageId: message.id,
                },
            });

            if (!response.errors) {
                deleteLocal();
            }
        } catch (error) {
            console.error(error);
        }
    }

    async function pin() {
        try {
            await sendRequest({
                query: "PIN_MESSAGE",
                params: {
                    channelId: message.channelId,
                    messageId: message.id,
                },
            });
        } catch (error) {
            console.error(error);
        }
    }

    async function unpin() {
        try {
            await sendRequest({
                query: "UNPIN_MESSAGE",
                params: {
                    channelId: message.channelId,
                    messageId: message.id,
                },
            });
        } catch (error) {
            console.error(error);
        }
    }

    async function copyText() {
        try {
            await navigator.clipboard.writeText(message.content || "");
        } catch (error) {
            console.error(error);
        }
    }

    async function copyLink() {
        try {
            await navigator.clipboard.writeText(
                `${window.location.origin}/channels/${channel.id}/${message.id}`
            );
        } catch (error) {
            console.error(error);
        }
    }

    async function copyId() {
        try {
            await navigator.clipboard.writeText(message.id.toString());
        } catch (error) {
            console.error(error);
        }
    }

    async function speak() {
        try {
            const toSpeak = `${message.author.displayName} says ${message.content}`;
            const utterance = new SpeechSynthesisUtterance(toSpeak);
            speechSynthesis.speak(utterance);
        } catch (error) {
            console.error(error);
        }
    }

    async function translate() {
        try {
            const translation = await translateString(message.content || "");
            setTranslation(translation);
        } catch (error) {
            console.error(error);
        }
    }

    const functions = {
        edit: editSubmit,
        delete: deleteMessage,
        pin,
        unpin,
        editState,
        replyState,
        deleteLocal,
        deletePopup: () => popup("DELETE_MESSAGE"),
        pinPopup: () => popup("PIN_MESSAGE"),
        unpinPopup: () => popup("UNPIN_MESSAGE"),
        copyText,
        copyLink,
        copyId,
        speak,
        translate,
        report: () => popup("REPORT_MESSAGE"),
        retry: () => sendMessage(),
    };

    message.functions = functions;

    if (message.needsToBeSent) {
        return null;
    }

    if (inline) {
        return (
            <li
                className={`${styles.container} ${styles.inline} ${isReply ? styles.reply : ""}`}
                onContextMenu={(e) => {
                    setLayers({
                        settings: { type: "MENU", event: e },
                        content: {
                            type: "MESSAGE",
                            message,
                            channel,
                            guild,
                        },
                    });
                }}
                style={{
                    backgroundColor: isMenuOpen ? "var(--background-hover-4)" : "",
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
                    show={isMenuOpen}
                    hide={isEditing}
                />

                <div className={styles.message}>
                    <div className={styles.specialIcon}>
                        <div
                            style={{
                                backgroundImage: `url(/assets/system/${
                                    messageIcons[message.type]
                                }.svg)`,
                                width: message.type === 7 ? "18px" : "16px",
                                height: message.type === 7 ? "18px" : "16px",
                                backgroundRepeat: "no-repeat",
                                backgroundSize: message.type === 7 ? "18px 18px" : "16px 16px",
                            }}
                        />
                    </div>

                    <div className={styles.content}>
                        <div style={{ whiteSpace: "pre-line" }}>
                            {(message.type === 2 || message.type === 3) && (
                                <span>
                                    <UserMention user={message.author} />{" "}
                                    {message.author.id !== message.userMentions[0]?.id ? (
                                        <>
                                            {message.type === 2 ? "added " : "removed "}
                                            <UserMention user={message.userMentions[0]} />{" "}
                                            {message.type === 2 ? "to " : "from "}the group.{" "}
                                        </>
                                    ) : (
                                        " left the group. "
                                    )}
                                </span>
                            )}

                            {message.type === 4 && (
                                <span>
                                    <UserMention user={message.author} /> changed the channel name:
                                    <span className={styles.bold}> {message.content} </span>
                                </span>
                            )}

                            {message.type === 5 && <span></span>}
                            {message.type === 6 && <span></span>}

                            {message.type === 7 && (
                                <span>
                                    <UserMention user={message.author} /> pinned{" "}
                                    <span
                                        className={styles.inlineMention}
                                        onClick={() => {}}
                                    >
                                        a message
                                    </span>{" "}
                                    to this channel. See all{" "}
                                    <span
                                        className={styles.inlineMention}
                                        onClick={() => {
                                            const pin = document.getElementById("pinnedMessages");
                                            setLayers({
                                                settings: {
                                                    type: "POPUP",
                                                    element: pin,
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

                            <Tooltip
                                delay={500}
                                gap={1}
                            >
                                <TooltipTrigger>
                                    <span className={styles.contentTimestamp}>
                                        <span style={{ userSelect: "text" }}>
                                            {getMidDate(message.createdAt)}
                                        </span>
                                    </span>
                                </TooltipTrigger>

                                <TooltipContent>{getLongDate(message.createdAt)}</TooltipContent>
                            </Tooltip>
                        </div>
                    </div>
                </div>
            </li>
        );
    }

    return (
        <li
            className={`
                        ${styles.container}
                        ${large ? styles.large : ""}
                        ${isReply ? styles.reply : ""}
                        ${isMentioned ? styles.mentioned : ""}
                    `}
            onContextMenu={(e) => {
                if (isEditing || message.loading || message.error) return;
                setLayers({
                    settings: { type: "MENU", event: e },
                    content: {
                        type: "MESSAGE",
                        message,
                        channel,
                        guild,
                    },
                });
            }}
            style={{ backgroundColor: isMenuOpen || isEditing ? "var(--background-hover-4)" : "" }}
        >
            <MessageMenu
                message={message}
                large={large}
                channel={channel}
                guild={guild}
                inline={inline}
                show={isMenuOpen}
                hide={isEditing}
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
                                    alt={message.reference.author.displayName}
                                    type="avatars"
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
                                                user: message.reference.author,
                                            },
                                        });
                                    }
                                }}
                                onContextMenu={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setLayers({
                                        settings: { type: "MENU", event: e },
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

                        {contentRef ? (
                            <div className={styles.contentRef}>
                                {contentRef}{" "}
                                {message.reference.edited && (
                                    <div className={styles.contentTimestamp}>
                                        <Tooltip
                                            delay={500}
                                            gap={1}
                                        >
                                            <TooltipTrigger>
                                                <span>(edited)</span>
                                            </TooltipTrigger>

                                            <TooltipContent>
                                                {getLongDate(message.reference.edited)}
                                            </TooltipContent>
                                        </Tooltip>
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

                <div className={styles.content}>
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
                            onContextMenu={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setLayers({
                                    settings: { type: "MENU", event: e },
                                    content: {
                                        type: "USER",
                                        user: message.author,
                                    },
                                });
                            }}
                        >
                            <Avatar
                                src={message.author.avatar}
                                alt={message.author.displayName}
                                type="avatars"
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
                                        settings: { type: "MENU", event: e },
                                        content: {
                                            type: "USER",
                                            user: message.author,
                                        },
                                    });
                                }}
                            >
                                {message.author?.displayName}
                            </span>

                            {message.loading && (
                                <span className={styles.titleTimestamp}>Sending...</span>
                            )}

                            {message.error && (
                                <span className={styles.titleTimestamp}>Error Sending</span>
                            )}

                            {!message.loading && !message.error && (
                                <Tooltip
                                    delay={500}
                                    gap={1}
                                >
                                    <TooltipTrigger>
                                        <span className={styles.titleTimestamp}>
                                            {getMidDate(message.createdAt)}
                                        </span>
                                    </TooltipTrigger>

                                    <TooltipContent>
                                        {getLongDate(message.createdAt)}
                                    </TooltipContent>
                                </Tooltip>
                            )}
                        </h3>
                    )}

                    {!large && (
                        <span
                            className={styles.messageTimestamp}
                            style={{ visibility: isMenuOpen ? "visible" : undefined }}
                        >
                            <Tooltip
                                delay={500}
                                gap={1}
                            >
                                <TooltipTrigger>
                                    <span>{getShortDate(message.createdAt)}</span>
                                </TooltipTrigger>

                                <TooltipContent>{getLongDate(message.createdAt)}</TooltipContent>
                            </Tooltip>
                        </span>
                    )}

                    <div
                        className={styles.mainContent}
                        style={{
                            whiteSpace: "pre-line",
                            opacity: message.loading && !hasAttachments ? 0.5 : 1,
                            color: message.error ? "var(--error-1)" : "",
                        }}
                    >
                        {isEditing ? (
                            <>
                                <TextArea
                                    channel={channel}
                                    messageObject={message}
                                    edit={edit}
                                />

                                <div className={styles.editHint}>
                                    escape to{" "}
                                    <span onClick={() => setEdit(message.id, null)}>cancel </span>•
                                    enter to{" "}
                                    <span
                                        onClick={() => {
                                            const str = edit?.content || "";
                                            editSubmit(str);
                                        }}
                                    >
                                        save{" "}
                                    </span>
                                </div>
                            </>
                        ) : (
                            content && (
                                <>
                                    {content}{" "}
                                    {message.edited && message.attachments.length === 0 && (
                                        <div className={styles.contentTimestamp}>
                                            <Tooltip
                                                delay={500}
                                                gap={1}
                                            >
                                                <TooltipTrigger>
                                                    <span>(edited)</span>
                                                </TooltipTrigger>

                                                <TooltipContent>
                                                    {getLongDate(message.edited)}
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                    )}
                                    {translation && (
                                        <div className={styles.translation}>
                                            {translation}
                                            <span onClick={() => setTranslation("")}>Dismiss</span>
                                        </div>
                                    )}
                                </>
                            )
                        )}

                        {hasAttachments && !(message.error || message.loading) && (
                            <MessageAttachments
                                message={message}
                                functions={functions}
                            />
                        )}

                        {message.embeds?.length > 0 && !(message.error || message.loading) && (
                            <MessageEmbeds
                                message={message}
                                functions={functions}
                            />
                        )}

                        {hasAttachments && (message.loading || message.error) && (
                            <div className={styles.imagesUpload}>
                                <img
                                    src="/assets/system/file-blank.svg"
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
                                        if (message.error) deleteLocal();
                                        else controller.abort();
                                    }}
                                >
                                    <Icon name="close" />
                                </div>
                            </div>
                        )}

                        {message.edited && hasAttachments && (
                            <div className={styles.contentTimestamp}>
                                <Tooltip
                                    delay={500}
                                    gap={1}
                                >
                                    <TooltipTrigger>
                                        <span>(edited)</span>
                                    </TooltipTrigger>

                                    <TooltipContent>
                                        {getLongDate(message.updatedAt)}
                                    </TooltipContent>
                                </Tooltip>
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
    );
}
