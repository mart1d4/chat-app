"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "../Layers/Tooltip/Tooltip";
import type { AppChannel, AppMessage, Guild, Invite, Message } from "@/type";
import { useAuthenticatedUser } from "@/hooks/useAuthenticatedUser";
import { getLongDate, getMidDate, getShortDate } from "@/lib/time";
import { useData, useMessages, useTriggerDialog } from "@/store";
import { useState, useMemo, useEffect, memo, useCallback } from "react";
import useFetchHelper from "@/hooks/useFetchHelper";
import { useUploadThing } from "@/lib/uploadthing";
import { translateString } from "@/lib/helpers";
import { sanitizeString } from "@/lib/strings";
import styles from "./Message.module.css";
import { isInline } from "@/lib/message";
import { FormatMessage } from "./Format";
import { Node } from "slate";
import {
    AttachmentList,
    PopoverTrigger,
    PopoverContent,
    MessageInvite,
    MessageEmbeds,
    MessageMenu,
    UserMention,
    TextArea,
    UserCard,
    Popover,
    Avatar,
    Icon,
} from "@components";

const messageIcons = {
    2: "user-channel-joined",
    3: "user-channel-left",
    4: "channel-update",
    7: "message-pin",
};

function serialize(nodes: Node[]) {
    if (!nodes) return "";
    return nodes.map((n) => Node.string(n)).join("\n");
}

export type MessageFunctions = {
    sendMessage: () => Promise<void>;
    editMessage: () => Promise<void>;
    deleteMessage: () => Promise<void>;
    deleteMessageLocally: () => void;
    deleteAttachment: (attachmentId: string) => Promise<void>;
    removeEmbeds: () => Promise<void>;
    pinMessage: () => Promise<void>;
    unpinMessage: () => Promise<void>;
    copyMessageContent: () => Promise<void>;
    copyMessageLink: () => Promise<void>;
    copyMessageId: () => Promise<void>;
    speakMessageContent: () => void;
    translateMessageContent: () => Promise<void>;
    setReplyToMessage: () => void;
    startEditingMessage: () => void;
};

export const Message = memo(
    ({
        message,
        setMessages,
        large,
        channel,
        guild,
    }: {
        message: AppMessage;
        setMessages: (
            type: "add" | "update" | "delete",
            messageId: number,
            message?: AppMessage
        ) => void;
        large: boolean;
        channel: AppChannel;
        guild?: Guild;
    }) => {
        const [invites, setInvites] = useState<Invite[]>([]);
        const [fileProgress, setFileProgress] = useState(0);
        const [translation, setTranslation] = useState("");
        const [content, setMessageContent] = useState<JSX.Element | null>(null);
        const [contentRef, setReferenceContent] = useState<JSX.Element | null>(null);
        const [hasMounted, setHasMounted] = useState(false);
        const [isSending, setIsSending] = useState(false);
        const [attachmentIds, setAttachmentIds] = useState<string[]>([]);
        const [isHovering, setIsHovering] = useState(false);

        const reply = useMessages((state) => state.replies.find((r) => r.messageId === message.id));
        const edit = useMessages((state) => state.edits.find((e) => e.messageId === message.id));
        const moveChannelUp = useData((state) => state.moveChannelUp);
        const setReply = useMessages((state) => state.setReply);
        const setEdit = useMessages((state) => state.setEdit);
        const { triggerDialog } = useTriggerDialog();
        const { sendRequest } = useFetchHelper();
        const user = useAuthenticatedUser();

        const isLocal = "loading" in message;
        const isMentioned = message.mentions.some((m) => m.id === user.id);

        // const isMenuOpen = layers.MENU?.content?.message?.id === message.id;
        const isMenuOpen = false;
        const controller = useMemo(() => new AbortController(), []);
        const hasAttachments = message.attachments?.length > 0;
        const isEditing = edit?.messageId === message.id;
        const isReply = reply?.messageId === message.id;
        const hasEmbeds = message.embeds.length > 0;
        const inline = isInline(message.type);

        const { startUpload, isUploading } = useUploadThingNoop(
            controller,
            setAttachmentIds,
            triggerDialog,
            setFileProgress,
            isLocal && message.send && !isSending
        );

        if (message.content && !inline && content === null) {
            setMessageContent(FormatMessage({ message: message }));
        }

        if (!isLocal && message.reference?.content && contentRef === null) {
            setReferenceContent(FormatMessage({ message: message.reference }));
        }

        if (isLocal && message.send && hasMounted && (!isSending || attachmentIds.length)) {
            sendMessage();
        }

        useEffect(() => {
            setHasMounted(true);
        }, []);

        async function sendMessage() {
            if (!isLocal) return;
            setIsSending(true);

            if (!!message.attachments.length && !attachmentIds.length) {
                startUpload(message.attachments.map((a) => a.file));
                return;
            }

            const ids = [...attachmentIds];
            setAttachmentIds([]);

            try {
                const att = ids.length
                    ? message.attachments.map((a, i) => ({
                          ...a,
                          id: ids[i],
                          url: undefined,
                          file: undefined,
                      }))
                    : [];

                const { data, errors } = await sendRequest({
                    query: "SEND_MESSAGE",
                    params: { channelId: channel.id },
                    body: {
                        message: {
                            attachments: att,
                            content: message.content,
                            reference: message.reference,
                        },
                    },
                });

                if (data?.message) {
                    setMessages("update", message.id, data.message);
                    moveChannelUp(channel.id);
                } else if (errors) {
                    setMessages("update", message.id, {
                        ...message,
                        error: true,
                        send: false,
                        loading: false,
                    });
                }
            } catch (error) {
                console.error(error);
                setMessages("update", message.id, {
                    ...message,
                    error: true,
                    send: false,
                    loading: false,
                });
            }

            setIsSending(false);
        }

        async function editMessage() {
            const str = serialize(JSON.parse(edit?.content || ""));
            const content = sanitizeString(str);

            if (content === message.content) {
                return setEdit(message.id, null);
            }

            if (!content && !hasAttachments) {
                return triggerDialog({ type: "DELETE_MESSAGE" });
            }

            if (content.length > 16000) {
                return triggerDialog({ type: "MESSAGE_LIMIT" });
            }

            try {
                const { errors } = await sendRequest({
                    query: "UPDATE_MESSAGE",
                    params: {
                        channelId: channel.id,
                        messageId: message.id,
                    },
                    body: { content },
                });

                if (!errors) {
                    setMessages("update", message.id, {
                        ...message,
                        content: content,
                        edited: new Date().toISOString(),
                    });
                    setMessageContent(FormatMessage({ message: { ...message, content } }));
                    setEdit(message.id, null);
                } else {
                    throw new Error("Failed to update message");
                }
            } catch (error) {
                console.error(error);
            }
        }

        function deleteMessageLocally() {
            setMessages("delete", message.id);
        }

        function startEditingMessage() {
            setEdit(
                message.id,
                JSON.stringify([
                    {
                        type: "paragraph",
                        children: [
                            {
                                text: message.content,
                            },
                        ],
                    },
                ])
            );
        }

        function setReplyToMessage() {
            setReply(channel.id, message.id, message.author.displayName);
        }

        async function deleteMessage() {
            try {
                const { errors } = await sendRequest({
                    query: "DELETE_MESSAGE",
                    params: {
                        channelId: channel.id,
                        messageId: message.id,
                    },
                });

                if (!errors) deleteMessageLocally();
            } catch (error) {
                console.error(error);
            }
        }

        async function deleteAttachment(attachmentId: string) {
            const newAttachments = message.attachments.filter((a) => a.id !== attachmentId);

            try {
                const { errors } = await sendRequest({
                    query: "UPDATE_MESSAGE",
                    params: {
                        channelId: channel.id,
                        messageId: message.id,
                    },
                    body: {
                        attachments: newAttachments.map((a) => a.id),
                    },
                });

                if (!errors) {
                    setMessages("update", message.id, {
                        ...message,
                        attachments: newAttachments,
                    });
                }
            } catch (error) {
                console.error(error);
            }
        }

        async function removeEmbeds() {
            try {
                const { errors } = await sendRequest({
                    query: "UPDATE_MESSAGE",
                    params: {
                        channelId: channel.id,
                        messageId: message.id,
                    },
                    body: {
                        hideEmbeds: true,
                    },
                });

                if (!errors) {
                    setMessages("update", message.id, {
                        ...message,
                        embeds: [],
                    });
                }
            } catch (error) {
                console.error(error);
            }
        }

        async function pinMessage() {
            try {
                const { errors } = await sendRequest({
                    query: "PIN_MESSAGE",
                    params: {
                        channelId: channel.id,
                        messageId: message.id,
                    },
                });

                if (!errors) {
                    setMessages("update", message.id, {
                        ...message,
                        pinned: new Date().toISOString(),
                    });
                }
            } catch (error) {
                console.error(error);
            }
        }

        async function unpinMessage() {
            try {
                const { errors } = await sendRequest({
                    query: "UNPIN_MESSAGE",
                    params: {
                        channelId: channel.id,
                        messageId: message.id,
                    },
                });

                if (!errors) {
                    setMessages("update", message.id, { ...message, pinned: null });
                }
            } catch (error) {
                console.error(error);
            }
        }

        async function copyMessageContent() {
            try {
                await navigator.clipboard.writeText(message.content);
            } catch (error) {
                console.error(error);
            }
        }

        async function copyMessageLink() {
            try {
                await navigator.clipboard.writeText(
                    `${window.location.origin}/channels/${channel.id}/${message.id}`
                );
            } catch (error) {
                console.error(error);
            }
        }

        async function copyMessageId() {
            try {
                await navigator.clipboard.writeText(message.id.toString());
            } catch (error) {
                console.error(error);
            }
        }

        async function speakMessageContent() {
            try {
                const toSpeak = `${message.author.displayName} says ${message.content}`;
                const utterance = new SpeechSynthesisUtterance(toSpeak);
                speechSynthesis.speak(utterance);
            } catch (error) {
                console.error(error);
            }
        }

        async function translateMessageContent() {
            try {
                const translation = await translateString(message.content);
                setTranslation(translation);
            } catch (error) {
                console.error(error);
            }
        }

        const functions = {
            sendMessage,
            editMessage,
            deleteMessage,
            deleteMessageLocally,
            deleteAttachment,
            removeEmbeds,
            pinMessage,
            unpinMessage,
            copyMessageContent,
            copyMessageLink,
            copyMessageId,
            speakMessageContent,
            translateMessageContent,
            setReplyToMessage,
            startEditingMessage,
        };

        const classNames = (inline = false) =>
            [
                styles.container,
                large && !inline && styles.large,
                isReply && styles.reply,
                isMentioned && styles.mentioned,
                inline && styles.inline,
            ]
                .filter(Boolean)
                .join(" ");

        if (inline) {
            return (
                <li
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                    className={classNames(true)}
                    onContextMenu={() => {
                        // setLayers({
                        //     settings: { type: "MENU", event: e },
                        //     content: {
                        //         type: "MESSAGE",
                        //         message,
                        //         channel,
                        //         guild,
                        //     },
                        // });
                    }}
                    style={{
                        backgroundColor: isMenuOpen ? "var(--background-hover-4)" : "",
                        marginTop: large ? "1.0625rem" : "",
                    }}
                >
                    {isHovering && (
                        <MessageMenu
                            message={message}
                            functions={functions}
                            large={false}
                            inline={inline}
                            show={isMenuOpen}
                            hide={isEditing}
                        />
                    )}

                    <div className={styles.message}>
                        <div className={styles.specialIcon}>
                            <div
                                style={{
                                    backgroundImage: `url(/assets/system/${
                                        messageIcons[message.type as keyof typeof messageIcons]
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
                                        {message.author.id !== message.mentions[0]?.id ? (
                                            <>
                                                {message.type === 2 ? "added " : "removed "}
                                                <UserMention user={message.mentions[0]} />{" "}
                                                {message.type === 2 ? "to " : "from "}the group.{" "}
                                            </>
                                        ) : (
                                            " left the group. "
                                        )}
                                    </span>
                                )}

                                {message.type === 4 && (
                                    <span>
                                        <UserMention user={message.author} /> changed the channel
                                        name:
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
                                                // const pin = document.getElementById("pinnedMessages");
                                                // setLayers({
                                                //     settings: {
                                                //         type: "POPUP",
                                                //         element: pin,
                                                //         firstSide: "BOTTOM",
                                                //         secondSide: "LEFT",
                                                //         gap: 10,
                                                //     },
                                                //     content: {
                                                //         type: "PINNED_MESSAGES",
                                                //         channel: channel,
                                                //     },
                                                // });
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

                                    <TooltipContent>
                                        {getLongDate(message.createdAt)}
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        </div>
                    </div>
                </li>
            );
        }

        return (
            <li
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                className={classNames()}
                onContextMenu={() => {
                    // setLayers({
                    //     settings: { type: "MENU", event: e },
                    //     content: {
                    //         type: "MESSAGE",
                    //         message,
                    //         channel,
                    //         guild,
                    //     },
                    // });
                }}
                style={{
                    backgroundColor: isMenuOpen || isEditing ? "var(--background-hover-4)" : "",
                }}
            >
                {isHovering && (
                    <MessageMenu
                        message={message}
                        functions={functions}
                        large={large}
                        inline={inline}
                        show={isMenuOpen}
                        hide={isEditing}
                    />
                )}

                <div className={styles.message}>
                    {message.type === 1 && (
                        <div className={styles.messageReply}>
                            {!isLocal && message.reference ? (
                                <Popover placement="right-start">
                                    <PopoverTrigger asChild>
                                        <div
                                            className={styles.userAvatarReply}
                                            onDoubleClick={(e) => e.stopPropagation()}
                                            onContextMenu={() => {
                                                // setLayers({
                                                //     settings: {
                                                //         type: "MENU",
                                                //         event: e,
                                                //     },
                                                //     content: {
                                                //         type: "USER",
                                                //         user: message.reference.author,
                                                //     },
                                                // });
                                            }}
                                        >
                                            <Avatar
                                                src={message.reference.author.avatar}
                                                alt={message.reference.author.displayName}
                                                size={16}
                                            />
                                        </div>
                                    </PopoverTrigger>

                                    <PopoverContent>
                                        <UserCard user={message.reference.author} />
                                    </PopoverContent>
                                </Popover>
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

                            {!isLocal && message.reference && (
                                <Popover placement="right-start">
                                    <PopoverTrigger asChild>
                                        <span
                                            onMouseDown={(e) => e.stopPropagation()}
                                            onContextMenu={() => {
                                                // setLayers({
                                                //     settings: { type: "MENU", event: e },
                                                //     content: {
                                                //         type: "USER",
                                                //         user: message.reference.author,
                                                //     },
                                                // });
                                            }}
                                        >
                                            {message.reference.author.displayName}
                                        </span>
                                    </PopoverTrigger>

                                    <PopoverContent>
                                        <UserCard user={message.reference.author} />
                                    </PopoverContent>
                                </Popover>
                            )}

                            {contentRef ? (
                                <div className={styles.contentRef}>
                                    {contentRef}{" "}
                                    {!isLocal && message.reference?.edited && (
                                        <div className={styles.contentTimestamp}>
                                            <Tooltip
                                                gap={1}
                                                delay={500}
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
                                    {!isLocal && (message.reference?.attachments.length || 0) > 0
                                        ? "Click to see attachment"
                                        : "Original message was deleted"}
                                </div>
                            )}

                            {!isLocal && (message.reference?.attachments.length || 0) > 0 && (
                                <Icon
                                    name="image"
                                    size={20}
                                />
                            )}
                        </div>
                    )}

                    <div className={styles.content}>
                        {large && (
                            <Popover placement="right-start">
                                <PopoverTrigger asChild>
                                    <div
                                        className={styles.userAvatar}
                                        onContextMenu={() => {
                                            // setLayers({
                                            //     settings: { type: "MENU", event: e },
                                            //     content: {
                                            //         type: "USER",
                                            //         user: message.author,
                                            //     },
                                            // });
                                        }}
                                    >
                                        <Avatar
                                            src={message.author.avatar}
                                            alt={message.author.displayName}
                                            size={40}
                                        />
                                    </div>
                                </PopoverTrigger>

                                <PopoverContent>
                                    <UserCard user={message.author} />
                                </PopoverContent>
                            </Popover>
                        )}

                        {large && (
                            <h3>
                                <Popover placement="right-start">
                                    <PopoverTrigger asChild>
                                        <span
                                            className={styles.titleUsername}
                                            onDoubleClick={(e) => e.stopPropagation()}
                                            onContextMenu={() => {
                                                // setLayers({
                                                //     settings: { type: "MENU", event: e },
                                                //     content: {
                                                //         type: "USER",
                                                //         user: message.author,
                                                //     },
                                                // });
                                            }}
                                        >
                                            {message.author?.displayName}
                                        </span>
                                    </PopoverTrigger>

                                    <PopoverContent>
                                        <UserCard user={message.author} />
                                    </PopoverContent>
                                </Popover>

                                {isLocal && message.loading && (
                                    <span className={styles.titleTimestamp}>Sending...</span>
                                )}

                                {isLocal && message.error && (
                                    <span className={styles.titleTimestamp}>Error Sending</span>
                                )}

                                {!isLocal && (
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

                                    <TooltipContent>
                                        {getLongDate(message.createdAt)}
                                    </TooltipContent>
                                </Tooltip>
                            </span>
                        )}

                        <div
                            className={styles.mainContent}
                            style={{
                                whiteSpace: "pre-line",
                                opacity: isLocal && message.loading && !hasAttachments ? 0.5 : 1,
                                color: isLocal && message.error ? "var(--error-1)" : "",
                            }}
                        >
                            {isEditing ? (
                                <>
                                    <TextArea
                                        edit={edit}
                                        channel={channel}
                                        functions={functions}
                                        messageObject={message}
                                    />

                                    <div className={styles.editHint}>
                                        escape to{" "}
                                        <span
                                            tabIndex={0}
                                            onClick={() => setEdit(message.id, null)}
                                        >
                                            cancel{" "}
                                        </span>
                                        • enter to{" "}
                                        <span
                                            tabIndex={0}
                                            onClick={() => editMessage()}
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
                                                <span onClick={() => setTranslation("")}>
                                                    Dismiss
                                                </span>
                                            </div>
                                        )}
                                    </>
                                )
                            )}

                            {hasAttachments && !isLocal && (
                                <AttachmentList
                                    message={message}
                                    functions={functions}
                                />
                            )}

                            {hasEmbeds && !isLocal && (
                                <MessageEmbeds
                                    message={message}
                                    functions={functions}
                                />
                            )}

                            {hasAttachments && isLocal && (message.loading || message.error) && (
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
                                                            ? message.attachments[0].filename
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
                                                        transform: `translate3d(-${
                                                            100 - fileProgress
                                                        }%, 0, 0)`,
                                                        backgroundColor: message.error
                                                            ? "var(--error-1)"
                                                            : "",
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => {
                                            if (!isUploading) return;
                                            controller.abort();
                                            deleteMessageLocally();
                                            // Should also add the files and the message back to the textarea
                                        }}
                                    >
                                        <Icon name="close" />
                                    </button>
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
                                            {getLongDate(message.edited)}
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
    },
    (prevProps, nextProps) => {
        // Only check if message is the same
        return JSON.stringify(prevProps.message) === JSON.stringify(nextProps.message);
    }
);

// hook that does nothiing and returns the same value
const useUploadThingNoop = (
    controller,
    setAttachmentIds,
    triggerDialog,
    setFileProgress,
    shouldrun
) => {
    if (!shouldrun) return { startUpload: () => {}, isUploading: false };
    return useUploadThing("attachmentUploader", {
        onClientUploadComplete: (files) => {
            const ids = files.map((file) => file.key);
            setAttachmentIds(ids);
        },
        onUploadError: (error) => {
            console.error(error);
            triggerDialog({ type: "UPLOAD_FAILED" });
        },
        onUploadAborted: () => {
            console.log("Upload aborted");
        },
        onUploadProgress: (progress) => {
            setFileProgress(progress);
        },
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        signal: controller.signal,
    });
};
