"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "../Layers/Tooltip/Tooltip";
import { useData, useLayers, useWindowSettings } from "@/store";
import type { Channel, Guild, Message } from "@/type";
import useFetchHelper from "@/hooks/useFetchHelper";
import { useRef, type LegacyRef } from "react";
import styles from "./Message.module.css";
import { Icon } from "@components";

export function MessageMenu({
    message,
    channel,
    guild,
    large,
    inline,
    show,
    hide,
}: {
    message: Message;
    channel: Channel;
    guild?: Guild;
    large?: boolean;
    inline?: boolean;
    show?: boolean;
    hide?: boolean;
}) {
    const shift = useWindowSettings((state) => state.shiftKeyDown);

    const user = useData((state) => state.user);
    const { sendRequest } = useFetchHelper();

    const moreButton = useRef<HTMLButtonElement>(null);
    const menuSender = message.author.id === user?.id;

    if (message.loading) return null;

    const buttons: {
        [key: string]: {
            text: string;
            onClick: () => void;
            icon: string;
            iconViewbox?: string;
            dangerous?: boolean;
            ref?: LegacyRef<HTMLButtonElement>;
        };
    } = {
        COPY_ID: {
            text: "Copy Message ID",
            onClick: () => message.functions?.copyId(),
            icon: "id",
        },
        PIN_MESSAGE: {
            text: `${message.pinned ? "Unpin" : "Pin"} Message`,
            onClick: () => {
                sendRequest({
                    query: message.pinned ? "UNPIN_MESSAGE" : "PIN_MESSAGE",
                    params: {
                        channelId: message.channelId,
                        messageId: message.id,
                    },
                });
            },
            icon: "pin",
        },
        COPY_TEXT: {
            text: "Copy Text",
            onClick: () => message.functions?.copyText(),
            icon: "copy",
        },
        TRANSLATE: {
            text: "Translate",
            onClick: () => message.functions?.translate(),
            icon: "translate",
            iconViewbox: "0 96 960 960",
        },
        MARK_UNREAD: {
            text: "Mark Unread",
            onClick: () => {},
            icon: "mark",
        },
        COPY_LINK: {
            text: "Copy Message Link",
            onClick: () => message.functions?.copyLink(),
            icon: "link",
        },
        SPEAK: {
            text: "Speak Message",
            onClick: () => message.functions?.speak(),
            icon: "speak",
        },
        ADD_REACTION: {
            text: "Add Reaction",
            onClick: () => {},
            icon: "addReaction",
        },
        EDIT: {
            text: "Edit",
            onClick: () => message.functions?.editState(),
            icon: "edit",
        },
        REPLY: {
            text: "Reply",
            onClick: () => message.functions?.replyState(),
            icon: "reply",
        },
        MORE: {
            text: "More",
            onClick: () => {
                setLayers({
                    settings: {
                        type: "MENU",
                        element: moreButton.current,
                        firstSide: "LEFT",
                        gap: 5,
                    },
                    content: {
                        type: "MESSAGE",
                        message,
                        channel,
                        guild,
                    },
                });
            },
            icon: "dots",
            ref: moreButton,
        },
        DELETE: {
            text: "Delete",
            onClick: () => {
                sendRequest({
                    query: "DELETE_MESSAGE",
                    params: {
                        channelId: message.channelId,
                        messageId: message.id,
                    },
                });
            },
            icon: "delete",
            dangerous: true,
        },
        REPORT: {
            text: "Report Message",
            onClick: () => message.functions?.report(),
            icon: "report",
            dangerous: true,
        },
        RETRY: {
            text: "Retry",
            onClick: () => message.functions?.retry(),
            icon: "retry",
        },
    };

    function renderButton(button: keyof typeof buttons) {
        const { text, onClick, icon, iconViewbox, dangerous, ref } = buttons[button];
        let backgroundColor = "";

        // if (ref && layers.MENU?.settings?.element === ref.current) {
        //     backgroundColor = "var(--background-hover-2)";
        // }

        return (
            <Tooltip>
                <TooltipTrigger>
                    <button
                        key={text}
                        onClick={onClick}
                        ref={ref ? ref : undefined}
                        style={{ backgroundColor }}
                        className={dangerous ? styles.red : undefined}
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

                            {!inline && (menuSender ? renderButton("EDIT") : renderButton("REPLY"))}

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
