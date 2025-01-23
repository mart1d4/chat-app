"use client";

import type { DMChannel, GuildChannel, LocalMessage, ResponseMessage, UserGuild } from "@/type";
import { TooltipContent, TooltipTrigger, MenuTrigger, Tooltip, Icon, Menu } from "@components";
import { MessageMenuContent } from "../Layers/Menu/MenuContents/Message";
import { useAuthenticatedUser } from "@/hooks/useAuthenticatedUser";
import { useEmojiPicker, useWindowSettings } from "@/store";
import type { MessageFunctions } from "./Message";
import styles from "./Message.module.css";
import { useRef } from "react";

export function MessageMenu({
    message,
    functions,
    channel,
    guild,
    large,
    inline,
}: {
    message: ResponseMessage | LocalMessage;
    functions: MessageFunctions;
    channel: DMChannel | GuildChannel;
    guild: UserGuild | undefined;
    large?: boolean;
    inline?: boolean;
}) {
    const { shiftKeyDown: shift } = useWindowSettings();
    const user = useAuthenticatedUser();

    const { data: emojiPickerData, setData: setEmojiPickerData } = useEmojiPicker();
    const hasVoice = !!message.attachments.find((a) => a.voiceMessage);
    const menuSender = message.author.id === user.id;
    const emojiPickerRef = useRef(null);

    const isPickerOpen =
        emojiPickerData.open && emojiPickerData.container === emojiPickerRef.current;

    if ("loading" in message && message.loading) return null;

    const buttons: {
        [key: string]: {
            text: string;
            onClick: () => void;
            icon: string;
            iconViewbox?: string;
            dangerous?: boolean;
        };
    } = {
        COPY_ID: {
            text: "Copy Message ID",
            onClick: () => functions.copyMessageId(),
            icon: "id",
        },
        PIN_MESSAGE: {
            text: `${message.pinned ? "Unpin" : "Pin"} Message`,
            onClick: () => {
                if (message.pinned) functions.unpinMessage();
                else functions.pinMessage();
            },
            icon: "pin",
        },
        COPY_TEXT: {
            text: "Copy Text",
            onClick: () => functions.copyMessageContent(),
            icon: "copy",
        },
        TRANSLATE: {
            text: "Translate",
            onClick: () => functions.translateMessageContent(),
            icon: "translate",
        },
        MARK_UNREAD: {
            text: "Mark Unread",
            onClick: () => {},
            icon: "mark",
        },
        COPY_LINK: {
            text: "Copy Message Link",
            onClick: () => functions.copyMessageLink(),
            icon: "link",
        },
        SPEAK: {
            text: "Speak Message",
            onClick: () => functions.speakMessageContent(),
            icon: "speak",
        },
        ADD_REACTION: {
            text: "Add Reaction",
            onClick: () => {
                setEmojiPickerData({
                    open: true,
                    container: emojiPickerRef.current,
                    placement: "left-start",
                    onClick: (emoji) => functions.addReaction(emoji),
                });
            },
            icon: "addReaction",
        },
        EDIT: {
            text: "Edit",
            onClick: () => functions.startEditingMessage(),
            icon: "edit",
        },
        REPLY: {
            text: "Reply",
            onClick: () => functions.setReplyToMessage(),
            icon: "reply",
        },
        MORE: {
            text: "More",
            onClick: () => {},
            icon: "dots",
        },
        DELETE: {
            text: "Delete",
            onClick: () => {
                if ("error" in message && message.error) {
                    functions.deleteMessageLocally();
                } else {
                    functions.deleteMessage();
                }
            },
            icon: "delete",
            dangerous: true,
        },
        REPORT: {
            text: "Report Message",
            onClick: () => {},
            icon: "report",
            dangerous: true,
        },
        RETRY: {
            text: "Retry",
            onClick: () => functions.sendMessage(),
            icon: "retry",
        },
    };

    function renderButton(button: keyof typeof buttons) {
        const { text, onClick, icon, iconViewbox, dangerous } = buttons[button];

        if (button === "MORE") {
            return (
                <Menu placement="left-start">
                    <Tooltip>
                        <TooltipTrigger>
                            <MenuTrigger>
                                <button
                                    key={text}
                                    onClick={onClick}
                                    className={dangerous ? styles.red : undefined}
                                >
                                    <Icon
                                        name={icon}
                                        viewbox={iconViewbox || undefined}
                                    />
                                </button>
                            </MenuTrigger>
                        </TooltipTrigger>

                        <TooltipContent>{text}</TooltipContent>

                        <MessageMenuContent
                            guild={guild}
                            channel={channel}
                            message={message}
                            functions={functions}
                        />
                    </Tooltip>
                </Menu>
            );
        }

        let id = "";
        if (button === "ADD_REACTION") {
            id = `emoji-picker-${message.id}`;
        }

        return (
            <Tooltip>
                <TooltipTrigger>
                    <button
                        id={id}
                        key={text}
                        onClick={onClick}
                        className={dangerous ? styles.red : undefined}
                        ref={button === "ADD_REACTION" ? emojiPickerRef : null}
                    >
                        <Icon
                            name={icon}
                            viewbox={iconViewbox || undefined}
                        />
                    </button>
                </TooltipTrigger>

                <TooltipContent>{text}</TooltipContent>
            </Tooltip>
        );
    }

    return (
        <div
            className={styles.buttonContainer}
            onContextMenu={(e) => {
                e.stopPropagation();
                e.preventDefault();
            }}
            style={{ opacity: isPickerOpen ? 1 : undefined }}
        >
            <div
                className={styles.buttonWrapper}
                style={{ top: large ? "-16px" : "-25px" }}
            >
                <div className={styles.buttons}>
                    {!("error" in message && message.error) ? (
                        <>
                            {shift && !inline && (
                                <>
                                    {renderButton("COPY_ID")}
                                    {renderButton("PIN_MESSAGE")}

                                    {message.content && renderButton("COPY_TEXT")}
                                    {message.content && renderButton("TRANSLATE")}

                                    {renderButton("MARK_UNREAD")}
                                    {renderButton("COPY_LINK")}

                                    {message.content && renderButton("SPEAK")}
                                </>
                            )}

                            {inline && shift && (
                                <>
                                    {renderButton("COPY_ID")}
                                    {message.content && renderButton("COPY_TEXT")}
                                    {renderButton("MARK_UNREAD")}
                                    {message.content && renderButton("COPY_LINK")}
                                </>
                            )}

                            {renderButton("ADD_REACTION")}

                            {!inline &&
                                (menuSender && !hasVoice
                                    ? renderButton("EDIT")
                                    : renderButton("REPLY"))}

                            {!shift || inline
                                ? renderButton("MORE")
                                : menuSender
                                ? renderButton("DELETE")
                                : renderButton("REPORT")}
                        </>
                    ) : (
                        <>
                            {renderButton("RETRY")}
                            {renderButton("DELETE")}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
