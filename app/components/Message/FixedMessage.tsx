"use client";

import { useLayers, useTooltip } from "@/lib/store";
import styles from "./FixedMessage.module.css";
import { Avatar, Icon } from "@components";
import { useState, useMemo } from "react";
import { v4 } from "uuid";

export const FixedMessage = ({ message, pinned }: { message: TMessage; pinned?: boolean }) => {
    const setTooltip = useTooltip((state) => state.setTooltip);
    const setLayers = useLayers((state) => state.setLayers);

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

    const UserMention = ({ user, full }: { user: TCleanUser; full: boolean }) => {
        if (!user) return null;
        return (
            <span className={full ? styles.mention : styles.inlineMention}>@{user.username}</span>
        );
    };

    const userRegex: RegExp = /<([@][a-zA-Z0-9]{24})>/g;
    const urlRegex = /https?:\/\/[-A-Za-z0-9+&@#/%?=~_|!:,.;]*[-A-Za-z0-9+&@#/%=~_|]/g;

    let messageContent: JSX.Element | null = null;
    if (message.content) {
        messageContent = (
            <span>
                {message.content.split(/(\s+)/).map((part, index) => {
                    if (userRegex.test(part)) {
                        const userId = part.substring(2).slice(0, -1);
                        const user = message.mentions?.find(
                            (user) => user.id === userId
                        ) as TCleanUser;
                        return (
                            <UserMention
                                key={v4()}
                                user={user}
                                full={true}
                            />
                        );
                    } else if (urlRegex.test(part)) {
                        return (
                            <span
                                key={v4()}
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

    let referencedContent: JSX.Element | null = null;
    if (message.messageReference?.content) {
        referencedContent = (
            <span>
                {message.messageReference?.content.split(/(\s+)/).map((part, index) => {
                    if (userRegex.test(part)) {
                        const userId = part.substring(2).slice(0, -1);
                        const user = message.mentions?.find(
                            (user) => user.id === userId
                        ) as TCleanUser;
                        return (
                            <UserMention
                                key={v4()}
                                user={user}
                                full={true}
                            />
                        );
                    } else if (urlRegex.test(part)) {
                        return (
                            <span
                                key={v4()}
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

    function edited(time) {
        return (
            <div className={styles.contentTimestamp}>
                <span
                    onMouseEnter={(e) => {
                        setTooltip({
                            text: getLongDate(time),
                            element: e.currentTarget,
                            delay: 1000,
                            wide: true,
                        });
                    }}
                    onMouseLeave={() => setTooltip(null)}
                >
                    (edited)
                </span>
            </div>
        );
    }

    return (
        <li className={styles.messageContainer}>
            {pinned && (
                <div className={styles.hoverContainer}>
                    <div role="button">
                        <div>Jump</div>
                    </div>

                    <svg
                        aria-hidden="true"
                        role="img"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        onClick={() =>
                            setLayers(
                                {
                                    settings: {
                                        type: "POPUP",
                                    },
                                    content: {
                                        type: "UNPIN_MESSAGE",
                                        channelId: message.channelId,
                                        message: message,
                                    },
                                },
                                true
                            )
                        }
                    >
                        <path
                            fill="currentColor"
                            d="M18.4 4L12 10.4L5.6 4L4 5.6L10.4 12L4 18.4L5.6 20L12 13.6L18.4 20L20 18.4L13.6 12L20 5.6L18.4 4Z"
                        />
                    </svg>
                </div>
            )}

            <div>
                {message.type === 1 && (
                    <div className={styles.messageReply}>
                        {message.messageReference ? (
                            <div className={styles.userAvatarReply}>
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
                            <span>{message.messageReference.author.displayName}</span>
                        )}

                        {referencedContent ? (
                            <div className={styles.referenceContent}>
                                {referencedContent}{" "}
                                {message.messageReference.edited &&
                                    edited(message.messageReference.edited)}
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

                <div className={styles.messageContent}>
                    <div className={styles.userAvatar}>
                        <Avatar
                            src={message.author.avatar}
                            alt={message.author.username}
                            size={40}
                        />
                    </div>

                    <h3>
                        <span className={styles.titleUsername}>{message.author?.displayName}</span>
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
                    </h3>

                    <div
                        style={{
                            whiteSpace: "pre-line",
                            opacity: message.waiting ? 0.5 : 1,
                            color: message.error ? "var(--error-1)" : "",
                        }}
                    >
                        {messageContent && (
                            <>
                                {messageContent}{" "}
                                {message.edited &&
                                    message.attachments.length === 0 &&
                                    edited(message.edited)}
                            </>
                        )}

                        {message.attachments.length > 0 && <MessageAttachments message={message} />}
                        {message.edited && message.attachments.length > 0 && edited(message.edited)}
                    </div>
                </div>
            </div>
        </li>
    );
};

const MessageAttachments = ({ message }: { message: TMessage }) => {
    const ImageComponent = ({ attachment }: { attachment: TAttachment }) => (
        <Image
            key={attachment.id}
            attachment={attachment}
            message={message}
        />
    );

    return (
        <div className={styles.attachments}>
            <div>
                {message.attachments.length === 1 && (
                    <div className={styles.gridOneBig}>
                        <ImageComponent attachment={message.attachments[0]} />
                    </div>
                )}

                {message.attachments.length === 2 && (
                    <div className={styles.gridTwo}>
                        {message.attachments.map((attachment) => (
                            <ImageComponent attachment={attachment} />
                        ))}
                    </div>
                )}

                {message.attachments.length === 3 && (
                    <div className={styles.gridTwo}>
                        <div className={styles.gridOneSolo}>
                            {message.attachments.slice(0, 1).map((attachment) => (
                                <ImageComponent attachment={attachment} />
                            ))}
                        </div>

                        <div className={styles.gridTwoColumn}>
                            <div>
                                <div>
                                    {message.attachments.slice(1, 2).map((attachment) => (
                                        <ImageComponent attachment={attachment} />
                                    ))}
                                </div>

                                <div>
                                    {message.attachments.slice(2, 3).map((attachment) => (
                                        <ImageComponent attachment={attachment} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {message.attachments.length === 4 && (
                    <div className={styles.gridFour}>
                        {message.attachments.map((attachment) => (
                            <ImageComponent attachment={attachment} />
                        ))}
                    </div>
                )}

                {message.attachments.length === 5 && (
                    <>
                        <div className={styles.gridTwo}>
                            {message.attachments.slice(0, 2).map((attachment) => (
                                <ImageComponent attachment={attachment} />
                            ))}
                        </div>

                        <div className={styles.gridThree}>
                            {message.attachments.slice(2, 5).map((attachment) => (
                                <ImageComponent attachment={attachment} />
                            ))}
                        </div>
                    </>
                )}

                {message.attachments.length === 6 && (
                    <div className={styles.gridThree}>
                        {message.attachments.map((attachment) => (
                            <ImageComponent attachment={attachment} />
                        ))}
                    </div>
                )}

                {message.attachments.length === 7 && (
                    <>
                        <div className={styles.gridOne}>
                            {message.attachments.slice(0, 1).map((attachment) => (
                                <ImageComponent attachment={attachment} />
                            ))}
                        </div>

                        <div className={styles.gridThree}>
                            {message.attachments.slice(1, 7).map((attachment) => (
                                <ImageComponent attachment={attachment} />
                            ))}
                        </div>
                    </>
                )}

                {message.attachments.length === 8 && (
                    <>
                        <div className={styles.gridTwo}>
                            {message.attachments.slice(0, 2).map((attachment) => (
                                <ImageComponent attachment={attachment} />
                            ))}
                        </div>

                        <div className={styles.gridThree}>
                            {message.attachments.slice(2, 8).map((attachment) => (
                                <ImageComponent attachment={attachment} />
                            ))}
                        </div>
                    </>
                )}

                {message.attachments.length === 9 && (
                    <div className={styles.gridThree}>
                        {message.attachments.map((attachment) => (
                            <ImageComponent attachment={attachment} />
                        ))}
                    </div>
                )}

                {message.attachments.length === 10 && (
                    <>
                        <div className={styles.gridOne}>
                            {message.attachments.slice(0, 1).map((attachment) => (
                                <ImageComponent attachment={attachment} />
                            ))}
                        </div>

                        <div className={styles.gridThree}>
                            {message.attachments.slice(1, 10).map((attachment) => (
                                <ImageComponent attachment={attachment} />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

type ImageComponent = {
    attachment: TAttachment;
    message: TMessage;
};

const Image = ({ attachment }: ImageComponent) => {
    const [hideSpoiler, setHideSpoiler] = useState<boolean>(false);
    const setTooltip = useTooltip((state) => state.setTooltip);
    const isHidden = attachment.isSpoiler && !hideSpoiler;

    return useMemo(
        () => (
            <div
                className={styles.image}
                onClick={() => {
                    if (isHidden) {
                        setHideSpoiler(true);
                    }
                }}
                style={{ cursor: isHidden ? "pointer" : "default" }}
            >
                <div>
                    <div>
                        <div style={{ cursor: isHidden ? "pointer" : "default" }}>
                            <div>
                                <img
                                    src={`${process.env.NEXT_PUBLIC_CDN_URL}${
                                        attachment.id
                                    }/-/resize/x${
                                        attachment.dimensions.height >= 350
                                            ? 350
                                            : attachment.dimensions.height
                                    }/-/format/webp/`}
                                    alt={attachment?.name}
                                    style={{ filter: isHidden ? "blur(44px)" : "none" }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {isHidden && <div className={styles.spoilerButton}>Spoiler</div>}
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
        [attachment, hideSpoiler]
    );
};
