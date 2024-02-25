"use client";

import { useData, useLayers, useTooltip } from "@/lib/store";
import useFetchHelper from "@/hooks/useFetchHelper";
import styles from "./Message.module.css";
import { useRef, useState } from "react";
import { Icon } from "@components";

export function MessageMenu({
    message,
    large,
    functions,
    channel,
    guild,
    inline,
    show,
    hide,
}: {
    message: Message;
    large?: boolean;
    functions: MessageFunctions;
    channel: Channel;
    guild?: Guild;
    inline?: boolean;
    show?: boolean;
    hide?: boolean;
}) {
    const [shift, setShift] = useState(false);

    const setTooltip = useTooltip((state) => state.setTooltip);
    const setLayers = useLayers((state) => state.setLayers);
    const layers = useLayers((state) => state.layers);
    const user = useData((state) => state.user);
    const { sendRequest } = useFetchHelper();

    const menuSender = message.author.id === user.id;
    const moreButton = useRef<HTMLDivElement>(null);

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
                                    ref={moreButton}
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
                                        setLayers({
                                            settings: {
                                                type: "MENU",
                                                element: moreButton.current,
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
                                    }}
                                    style={{
                                        backgroundColor:
                                            layers.MENU?.settings?.element === moreButton.current
                                                ? "var(--background-hover-2)"
                                                : "",
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
