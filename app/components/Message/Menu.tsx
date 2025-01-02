"use client";

import { Tooltip, TooltipContent, TooltipTrigger, Icon } from "@components";
import { useAuthenticatedUser } from "@/hooks/useAuthenticatedUser";
import type { MessageFunctions } from "./Message";
import { useWindowSettings } from "@/store";
import styles from "./Message.module.css";
import type { AppMessage } from "@/type";

export function MessageMenu({
    message,
    functions,
    large,
    inline,
    show,
    hide,
}: {
    message: AppMessage;
    functions: MessageFunctions;
    large?: boolean;
    inline?: boolean;
    show?: boolean;
    hide?: boolean;
}) {
    const shift = useWindowSettings((state) => state.shiftKeyDown);
    const user = useAuthenticatedUser();

    const menuSender = message.author.id === user.id;

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
            iconViewbox: "0 96 960 960",
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
            onClick: () => {},
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
            onClick: () => {
                // setLayers({
                //     settings: {
                //         type: "MENU",
                //         element: moreButton.current,
                //         firstSide: "LEFT",
                //         gap: 5,
                //     },
                //     content: {
                //         type: "MESSAGE",
                //         message,
                //         channel,
                //         guild,
                //     },
                // });
            },
            icon: "dots",
        },
        DELETE: {
            text: "Delete",
            onClick: () => functions.deleteMessage(),
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

        return (
            <Tooltip>
                <TooltipTrigger>
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
