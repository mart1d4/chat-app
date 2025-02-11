"use client";

import { useData, useEmojiPicker, useMessages, useTriggerDialog } from "@/store";
import { useAuthenticatedUser } from "@/hooks/useAuthenticatedUser";
import { getLongDate, getMidDate, getShortDate } from "@/lib/time";
import { useState, useMemo, useEffect, memo, useRef } from "react";
import useFetchHelper from "@/hooks/useFetchHelper";
import { useUploadThing } from "@/lib/uploadthing";
import { FormatMessage } from "./Formatter/Format";
import { translateString } from "@/lib/helpers";
import { sanitizeString } from "@/lib/strings";
import styles from "./Message.module.css";
import { isInline } from "@/lib/message";
import { nanoid } from "nanoid";
import { Node } from "slate";
import {
    MessageMenuContent,
    AttachmentList,
    PopoverTrigger,
    PopoverContent,
    TooltipTrigger,
    TooltipContent,
    MessageInvite,
    MessageEmbeds,
    DialogTrigger,
    DialogContent,
    MessageMenu,
    UserMention,
    MenuTrigger,
    TextArea,
    UserMenu,
    UserCard,
    Popover,
    Tooltip,
    Avatar,
    Pinned,
    Dialog,
    Icon,
    Menu,
} from "@components";
import type {
    ResponseMessage,
    GuildChannel,
    LocalMessage,
    UserGuild,
    DMChannel,
    Invite,
} from "@/type";

const messageIcons = {
    2: "joined-channel",
    3: "left-channel",
    4: "edit",
    7: "pin",
};

const welcomeMessages = [
    "Good to see you, {user}!",
    "{user} joined the party.",
    "{user} just showed up!",
    "{user} hopped into the server.",
    "A wild {user} appeared.",
    "{user} just landed.",
    "Welcome, {user}!",
    "Swoooosh. {user} just landed.",
    "Brace yourselves. {user} just joined the server.",
    "{user} just joined. Everyone, look busy!",
    "{user} is here.",
];

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
    addReaction: (reaction: string | number) => Promise<void>;
    removeReaction: (reaction: string | number) => Promise<void>;
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
        channel,
        guild,
        large,
    }: {
        message: ResponseMessage | LocalMessage;
        setMessages: (
            type: "add" | "update" | "delete",
            messageId: number,
            message?: ResponseMessage | LocalMessage,
            fullyReplace?: boolean
        ) => void;
        channel: DMChannel | GuildChannel;
        guild?: UserGuild;
        large: boolean;
    }) => {
        const [invites, setInvites] = useState<Invite[]>([]);
        const [fileProgress, setFileProgress] = useState(0);
        const [translation, setTranslation] = useState("");
        const [content, setMessageContent] = useState<JSX.Element | null>(null);
        const [contentRef, setReferenceContent] = useState<JSX.Element | null>(null);
        const [attachmentIds, setAttachmentIds] = useState<string[]>([]);
        const [startUploading, setStartUploading] = useState(false);
        const [hasRun, setHasRun] = useState(false);

        const reply = useMessages((state) => state.replies.find((r) => r.messageId === message.id));
        const edit = useMessages((state) => state.edits.find((e) => e.messageId === message.id));
        const moveChannelUp = useData((state) => state.moveChannelUp);
        const { setData: setEmojiPickerData } = useEmojiPicker();
        const setReply = useMessages((state) => state.setReply);
        const setEdit = useMessages((state) => state.setEdit);
        const { triggerDialog } = useTriggerDialog();
        const { sendRequest } = useFetchHelper();
        const user = useAuthenticatedUser();
        const emojiPickerRef = useRef(null);
        const isSending = useRef(true);

        const isLocal = "local" in message;
        const isMentioned = message.mentions.some((m) => m.id === user.id);

        const controller = useMemo(() => new AbortController(), []);
        const hasAttachments = message.attachments.length > 0;
        const hasEmbeds = message.embeds.length > 0;
        const reactions = message.reactions;
        const inline = isInline(message.type);
        const [messageContentPlain, setMessageContentPlain] = useState(message.content);

        if (message.content && !inline && content === null) {
            setMessageContent(FormatMessage({ message: message }));
        }

        if (!isLocal && message.reference?.content && contentRef === null) {
            setReferenceContent(FormatMessage({ message: message.reference }));
        }

        useEffect(() => {
            if (message.content !== messageContentPlain) {
                setMessageContentPlain(message.content);
                setMessageContent(FormatMessage({ message: message }));
            }
        }, [message.content, messageContentPlain]);

        useEffect(() => {
            if (!hasRun) {
                setHasRun(true);
            }

            if (!isLocal && !hasRun) {
                fetchInvites();
            }

            if (isLocal && (isSending.current || !!attachmentIds.length)) {
                sendMessage();
            }
        }, [hasRun, isSending, attachmentIds, message]);

        async function fetchInvites() {
            const inviteRegex = /https:\/\/spark.mart1d4.dev\/[a-zA-Z0-9]{7,32}/g;
            const matches = message.content?.match(inviteRegex);

            const urls: string[] = matches ? Array.from(new Set(matches)) : [];
            const codes = urls.map((url) => url.split("/").pop());

            if (codes.length === 0) return;

            try {
                const { data } = await sendRequest({
                    query: "GET_INVITES",
                    body: { codes },
                });

                if (data?.invites) {
                    if (data.invites.length) {
                        setInvites(data.invites);
                    } else {
                        setInvites(
                            Array.from({ length: codes.length }, () => ({
                                id: nanoid(),
                                error: "notfound",
                            }))
                        );
                    }
                }
            } catch (error) {
                console.error(error);

                setInvites(
                    Array.from({ length: codes.length }, () => ({
                        id: nanoid(),
                        error: "cannotfetch",
                    }))
                );
            }
        }

        async function sendMessage() {
            if (!isSending.current && !attachmentIds.length) return;
            isSending.current = false;

            if (hasAttachments && !attachmentIds.length) {
                setStartUploading(true);
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
                    setMessages("update", message.id, data.message, true);
                    moveChannelUp(channel.id);
                    setAttachmentIds([]);
                } else if (errors) {
                    setMessages("update", message.id, {
                        ...message,
                        error: true,
                    });
                    setAttachmentIds([...ids]);
                }
            } catch (error) {
                console.error(error);
                setMessages("update", message.id, {
                    ...message,
                    error: true,
                });
            }
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
                    setEdit(message.id, null);
                }
            } catch (error) {
                console.error(error);
            }
        }

        function deleteMessageLocally() {
            setMessages("delete", message.id);
        }

        function startEditingMessage() {
            if (message.attachments.find((a) => a.voiceMessage)) {
                return;
            }

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
            await sendRequest({
                query: "DELETE_MESSAGE",
                params: {
                    channelId: channel.id,
                    messageId: message.id,
                },
            });
        }

        async function deleteAttachment(id: string) {
            await sendRequest({
                query: "UPDATE_MESSAGE",
                params: {
                    channelId: channel.id,
                    messageId: message.id,
                },
                body: {
                    attachments: message.attachments.map((a) => a.id).filter((a) => a !== id),
                },
            });
        }

        async function removeEmbeds() {
            await sendRequest({
                query: "UPDATE_MESSAGE",
                params: {
                    channelId: channel.id,
                    messageId: message.id,
                },
                body: { hideEmbeds: true },
            });
        }

        async function pinMessage() {
            await sendRequest({
                query: "PIN_MESSAGE",
                params: {
                    channelId: channel.id,
                    messageId: message.id,
                },
            });
        }

        async function unpinMessage() {
            await sendRequest({
                query: "UNPIN_MESSAGE",
                params: {
                    channelId: channel.id,
                    messageId: message.id,
                },
            });
        }

        async function addReaction(reaction: string | number) {
            await sendRequest({
                query: "ADD_REACTION",
                params: {
                    channelId: channel.id,
                    messageId: message.id,
                    emoji: encodeURIComponent(reaction),
                },
            });
        }

        async function removeReaction(reaction: string | number) {
            await sendRequest({
                query: "REMOVE_REACTION",
                params: {
                    channelId: channel.id,
                    messageId: message.id,
                    emoji: encodeURIComponent(reaction),
                },
            });
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

        useEffect(() => {
            if (translation.length) {
                const el = document.getElementById(`translate-${message.id}`);
                el?.click();
            }
        }, [translation]);

        const functions = {
            sendMessage,
            editMessage,
            deleteMessage,
            deleteMessageLocally,
            deleteAttachment,
            removeEmbeds,
            pinMessage,
            unpinMessage,
            addReaction,
            removeReaction,
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
                !!reply && styles.reply,
                isMentioned && styles.mentioned,
                inline && styles.inline,
            ]
                .filter(Boolean)
                .join(" ");

        const pinnedTrigger = document.getElementById("pinned-messages-trigger");

        if (inline) {
            const welcome = welcomeMessages[message.author.id % welcomeMessages.length];

            return (
                <Menu
                    positionOnClick
                    openOnRightClick
                    placement="bottom-start"
                >
                    <MenuTrigger>
                        <li
                            className={classNames(true)}
                            style={{ marginTop: large ? "1.0625rem" : "" }}
                        >
                            <MessageMenu
                                guild={guild}
                                inline={inline}
                                channel={channel}
                                message={message}
                                functions={functions}
                            />

                            <div className={styles.message}>
                                <div className={styles.specialIcon}>
                                    <Icon
                                        size={[2, 3].includes(message.type) ? 22 : 18}
                                        name={
                                            messageIcons[message.type as keyof typeof messageIcons]
                                        }
                                    />
                                </div>

                                <div className={styles.content}>
                                    <div style={{ whiteSpace: "pre-line" }}>
                                        {(message.type === 2 || message.type === 3) && guild ? (
                                            <span>
                                                {welcome.slice(0, welcome.indexOf("{user}"))}
                                                <UserMention user={message.author} />
                                                {welcome.slice(welcome.indexOf("{user}") + 6)}{" "}
                                            </span>
                                        ) : (
                                            <span>
                                                <UserMention user={message.author} />{" "}
                                                {!!message.mentions.length ? (
                                                    <>
                                                        {message.type === 2 ? "added " : "removed "}
                                                        <UserMention
                                                            user={message.mentions[0]}
                                                        />{" "}
                                                        {message.type === 2 ? "to " : "from "}the
                                                        group.{" "}
                                                    </>
                                                ) : (
                                                    " left the group. "
                                                )}
                                            </span>
                                        )}

                                        {message.type === 4 && (
                                            <span>
                                                <UserMention user={message.author} /> changed the{" "}
                                                {message.content ? (
                                                    <>
                                                        channel name:
                                                        <span className={styles.bold}>
                                                            {" "}
                                                            {message.content}{" "}
                                                        </span>
                                                    </>
                                                ) : (
                                                    "group icon. "
                                                )}
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
                                                <Popover placement="bottom-end">
                                                    <PopoverTrigger
                                                        externalReference={pinnedTrigger}
                                                    >
                                                        <span className={styles.inlineMention}>
                                                            pinned messages
                                                        </span>
                                                    </PopoverTrigger>

                                                    <PopoverContent>
                                                        <Pinned channel={channel} />
                                                    </PopoverContent>
                                                </Popover>
                                                .{" "}
                                            </span>
                                        )}

                                        {message.type === 8 && <span></span>}

                                        <Tooltip
                                            gap={1}
                                            delay={500}
                                            bigMaxWidth
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

                                {!!reactions.length && (
                                    <div className={styles.reactions}>
                                        {reactions.map((reaction) => (
                                            <button
                                                key={nanoid()}
                                                className={`${styles.reaction} ${
                                                    reaction.me ? styles.me : ""
                                                }`}
                                                onClick={() => {
                                                    if (reaction.me) {
                                                        removeReaction(reaction.name);
                                                    } else {
                                                        addReaction(reaction.name);
                                                    }
                                                }}
                                            >
                                                <img
                                                    alt={reaction.name}
                                                    src={`/assets/emojis/${reaction.name}.svg`}
                                                />
                                                <span>{reaction.count || 1}</span>
                                            </button>
                                        ))}

                                        <Tooltip>
                                            <TooltipTrigger>
                                                <button
                                                    ref={emojiPickerRef}
                                                    className={styles.reaction}
                                                    onClick={() => {
                                                        setEmojiPickerData({
                                                            open: true,
                                                            container: emojiPickerRef.current,
                                                            placement: "right-start",
                                                            onClick: (emoji) =>
                                                                functions.addReaction(emoji),
                                                        });
                                                    }}
                                                >
                                                    <Icon
                                                        size={20}
                                                        name="emoji"
                                                    />
                                                </button>
                                            </TooltipTrigger>

                                            <TooltipContent>Add Reaction</TooltipContent>
                                        </Tooltip>
                                    </div>
                                )}
                            </div>
                        </li>
                    </MenuTrigger>

                    <MessageMenuContent
                        guild={guild}
                        channel={channel}
                        message={message}
                        functions={functions}
                    />
                </Menu>
            );
        }

        return (
            <Menu
                positionOnClick
                openOnRightClick
                placement="bottom-start"
            >
                <MenuTrigger>
                    <li
                        className={classNames()}
                        style={{ backgroundColor: !!edit ? "var(--background-hover-4)" : "" }}
                    >
                        <MessageMenu
                            large={large}
                            guild={guild}
                            inline={inline}
                            channel={channel}
                            message={message}
                            functions={functions}
                        />

                        <div className={styles.message}>
                            {message.type === 1 && (
                                <div className={styles.messageReply}>
                                    {!isLocal && message.reference ? (
                                        <Menu
                                            positionOnClick
                                            openOnRightClick
                                            placement="right-start"
                                        >
                                            <Popover placement="right-start">
                                                <PopoverTrigger asChild>
                                                    <MenuTrigger>
                                                        <div
                                                            className={styles.userAvatarReply}
                                                            onDoubleClick={(e) =>
                                                                e.stopPropagation()
                                                            }
                                                            onContextMenu={(e) => {
                                                                e.stopPropagation();
                                                                e.preventDefault();
                                                            }}
                                                        >
                                                            <Avatar
                                                                size={16}
                                                                type="user"
                                                                fileId={
                                                                    message.reference.author.avatar
                                                                }
                                                                generateId={
                                                                    message.reference.author.id
                                                                }
                                                                alt={
                                                                    message.reference.author
                                                                        .displayName
                                                                }
                                                            />
                                                        </div>
                                                    </MenuTrigger>
                                                </PopoverTrigger>

                                                <PopoverContent>
                                                    <UserCard initUser={message.reference.author} />
                                                </PopoverContent>

                                                <UserMenu
                                                    type="author"
                                                    channelType={channel.type}
                                                    user={message.reference.author}
                                                />
                                            </Popover>
                                        </Menu>
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
                                        <Menu
                                            positionOnClick
                                            openOnRightClick
                                            placement="right-start"
                                        >
                                            <Popover placement="right-start">
                                                <PopoverTrigger asChild>
                                                    <MenuTrigger>
                                                        <span
                                                            onMouseDown={(e) => e.stopPropagation()}
                                                            onContextMenu={(e) => {
                                                                e.stopPropagation();
                                                                e.preventDefault();
                                                            }}
                                                        >
                                                            {message.reference.author.displayName}
                                                        </span>
                                                    </MenuTrigger>
                                                </PopoverTrigger>

                                                <PopoverContent>
                                                    <UserCard initUser={message.reference.author} />
                                                </PopoverContent>

                                                <UserMenu
                                                    type="author"
                                                    channelType={channel.type}
                                                    user={message.reference.author}
                                                />
                                            </Popover>
                                        </Menu>
                                    )}

                                    {contentRef ? (
                                        <div className={styles.contentRef}>
                                            {contentRef}{" "}
                                            {!isLocal && message.reference?.edited && (
                                                <span className={styles.contentTimestamp}>
                                                    <Tooltip
                                                        gap={1}
                                                        delay={500}
                                                        bigMaxWidth
                                                    >
                                                        <TooltipTrigger>
                                                            <span>(edited)</span>
                                                        </TooltipTrigger>

                                                        <TooltipContent>
                                                            {getLongDate(message.reference.edited)}
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </span>
                                            )}
                                        </div>
                                    ) : (
                                        <div className={styles.italic}>
                                            {!isLocal &&
                                            (message.reference?.attachments.length || 0) > 0
                                                ? "Click to see attachment"
                                                : "Original message was deleted"}
                                        </div>
                                    )}

                                    {!isLocal &&
                                        (message.reference?.attachments.length || 0) > 0 && (
                                            <Icon
                                                name="image"
                                                size={20}
                                            />
                                        )}
                                </div>
                            )}

                            <div className={styles.content}>
                                {large && (
                                    <Menu
                                        positionOnClick
                                        openOnRightClick
                                        placement="right-start"
                                    >
                                        <Popover placement="right-start">
                                            <PopoverTrigger asChild>
                                                <MenuTrigger>
                                                    <div
                                                        className={styles.userAvatar}
                                                        onContextMenu={(e) => {
                                                            e.stopPropagation();
                                                            e.preventDefault();
                                                        }}
                                                    >
                                                        <Avatar
                                                            size={40}
                                                            type="user"
                                                            fileId={message.author.avatar}
                                                            generateId={message.author.id}
                                                            alt={message.author.displayName}
                                                        />
                                                    </div>
                                                </MenuTrigger>
                                            </PopoverTrigger>

                                            <PopoverContent>
                                                <UserCard initUser={message.author} />
                                            </PopoverContent>

                                            <UserMenu
                                                type="author"
                                                user={message.author}
                                                channelType={channel.type}
                                            />
                                        </Popover>
                                    </Menu>
                                )}

                                {large && (
                                    <h3>
                                        <Menu
                                            positionOnClick
                                            openOnRightClick
                                            placement="right-start"
                                        >
                                            <Popover placement="right-start">
                                                <PopoverTrigger asChild>
                                                    <MenuTrigger>
                                                        <span
                                                            className={styles.titleUsername}
                                                            onDoubleClick={(e) =>
                                                                e.stopPropagation()
                                                            }
                                                            onContextMenu={(e) => {
                                                                e.stopPropagation();
                                                                e.preventDefault();
                                                            }}
                                                        >
                                                            {message.author?.displayName}
                                                        </span>
                                                    </MenuTrigger>
                                                </PopoverTrigger>

                                                <PopoverContent>
                                                    <UserCard initUser={message.author} />
                                                </PopoverContent>

                                                <UserMenu
                                                    type="author"
                                                    user={message.author}
                                                    channelType={channel.type}
                                                />
                                            </Popover>
                                        </Menu>

                                        {isLocal && (
                                            <span className={styles.titleTimestamp}>
                                                {message.error ? "Error Sending" : "Sending..."}
                                            </span>
                                        )}

                                        {!isLocal && (
                                            <Tooltip
                                                gap={1}
                                                delay={500}
                                                bigMaxWidth
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
                                    <span className={styles.messageTimestamp}>
                                        <Tooltip
                                            gap={1}
                                            delay={500}
                                            bigMaxWidth
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
                                        opacity:
                                            isLocal && !message.error && !hasAttachments ? 0.5 : 1,
                                        color: isLocal && message.error ? "var(--error-1)" : "",
                                    }}
                                >
                                    {!!edit ? (
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
                                                {message.edited && !message.attachments.length && (
                                                    <span className={styles.contentTimestamp}>
                                                        <Tooltip
                                                            delay={500}
                                                            bigMaxWidth
                                                        >
                                                            <TooltipTrigger>
                                                                <span>(edited)</span>
                                                            </TooltipTrigger>

                                                            <TooltipContent>
                                                                {getLongDate(message.edited)}
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </span>
                                                )}
                                            </>
                                        )
                                    )}

                                    {translation && !edit && (
                                        <Dialog>
                                            <DialogTrigger>
                                                <button
                                                    className={styles.translation}
                                                    id={`translate-${message.id}`}
                                                >
                                                    See Translation
                                                </button>
                                            </DialogTrigger>

                                            <DialogContent
                                                showClose
                                                hideCancel
                                                width={600}
                                                confirmLabel="Okay"
                                                heading="Translation"
                                            >
                                                <p className={styles.translationText}>
                                                    {translation}
                                                </p>
                                            </DialogContent>
                                        </Dialog>
                                    )}

                                    {hasAttachments && !isLocal && (
                                        <AttachmentList
                                            message={message}
                                            channel={channel}
                                            functions={functions}
                                        />
                                    )}

                                    {hasEmbeds && !isLocal && (
                                        <MessageEmbeds
                                            message={message}
                                            functions={functions}
                                        />
                                    )}

                                    {hasAttachments && isLocal && (
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
                                                                    ? message.attachments[0]
                                                                          .filename
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
                                        <span className={styles.contentTimestamp}>
                                            <Tooltip
                                                gap={1}
                                                delay={500}
                                                bigMaxWidth
                                            >
                                                <TooltipTrigger>
                                                    <span>(edited)</span>
                                                </TooltipTrigger>

                                                <TooltipContent>
                                                    {getLongDate(message.edited)}
                                                </TooltipContent>
                                            </Tooltip>
                                        </span>
                                    )}
                                </div>

                                {!!invites.length && (
                                    <div className={styles.messageAccessories}>
                                        {invites.map((invite) => (
                                            <MessageInvite
                                                invite={invite}
                                                message={message}
                                                key={invite.code || nanoid()}
                                            />
                                        ))}
                                    </div>
                                )}

                                {!!reactions.length && (
                                    <div className={styles.reactions}>
                                        {reactions.map((reaction) => (
                                            <button
                                                key={nanoid()}
                                                className={`${styles.reaction} ${
                                                    reaction.me ? styles.me : ""
                                                }`}
                                                onClick={() => {
                                                    if (reaction.me) {
                                                        removeReaction(reaction.name);
                                                    } else {
                                                        addReaction(reaction.name);
                                                    }
                                                }}
                                            >
                                                <img
                                                    alt={reaction.name}
                                                    src={`/assets/emojis/${reaction.name}.svg`}
                                                />
                                                <span>{reaction.count || 1}</span>
                                            </button>
                                        ))}

                                        <Tooltip>
                                            <TooltipTrigger>
                                                <button
                                                    ref={emojiPickerRef}
                                                    className={styles.reaction}
                                                    onClick={() => {
                                                        setEmojiPickerData({
                                                            open: true,
                                                            container: emojiPickerRef.current,
                                                            placement: "right-start",
                                                            onClick: (emoji) =>
                                                                functions.addReaction(emoji),
                                                        });
                                                    }}
                                                >
                                                    <Icon
                                                        size={20}
                                                        name="emoji"
                                                    />
                                                </button>
                                            </TooltipTrigger>

                                            <TooltipContent>Add Reaction</TooltipContent>
                                        </Tooltip>
                                    </div>
                                )}
                            </div>
                        </div>

                        {startUploading && (
                            <UploadAttachments
                                controller={controller}
                                setMessages={setMessages}
                                message={message as LocalMessage}
                                setAttachmentIds={setAttachmentIds}
                                setFileProgress={setFileProgress}
                                setStartUploading={setStartUploading}
                            />
                        )}
                    </li>
                </MenuTrigger>

                <MessageMenuContent
                    guild={guild}
                    channel={channel}
                    message={message}
                    functions={functions}
                />
            </Menu>
        );
    }
    // (prevProps, nextProps) => {
    //     return JSON.stringify(prevProps.message) === JSON.stringify(nextProps.message);
    // }
);

function UploadAttachments({
    setAttachmentIds,
    setFileProgress,
    setStartUploading,
    message,
    setMessages,
    controller,
}: {
    setAttachmentIds: (ids: string[]) => void;
    setFileProgress: (progress: number) => void;
    setStartUploading: (uploading: boolean) => void;
    message: LocalMessage;
    setMessages: (
        type: "add" | "update" | "delete",
        messageId: number,
        message?: ResponseMessage | LocalMessage
    ) => void;
    controller: AbortController;
}) {
    const { triggerDialog } = useTriggerDialog();
    const hasRun = useRef(false);

    const { startUpload } = useUploadThing("attachmentUploader", {
        onClientUploadComplete: (files) => {
            const ids = files.map((file) => file.key);
            setAttachmentIds(ids);
            setStartUploading(false);
        },
        onUploadError: () => {
            triggerDialog({ type: "UPLOAD_FAILED" });
            setAttachmentIds([]);
            setFileProgress(100);
            setStartUploading(false);
            setMessages("update", message.id, {
                ...message,
                error: true,
                send: false,
                loading: false,
            });
        },
        onUploadProgress: (progress) => {
            setFileProgress(progress);
        },
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        signal: controller.signal,
    });

    useEffect(() => {
        if (!hasRun.current) {
            hasRun.current = true;
            startUpload(message.attachments.map((a) => a.file));
        }
    }, []);

    return null;
}
