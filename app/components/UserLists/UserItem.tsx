"use client";

import useFetchHelper from "@/hooks/useFetchHelper";
import { useLayers, useTooltip } from "@/lib/store";
import { ReactElement, useRef } from "react";
import { translateCap } from "@/lib/strings";
import styles from "./UserItem.module.css";
import { Avatar, Icon } from "@components";
import { UserTable } from "@/lib/db/types";

type Props = {
    content: string;
    user: Partial<UserTable>;
};

export const UserItem = ({ content, user }: Props): ReactElement => {
    const setTooltip = useTooltip((state) => state.setTooltip);
    const setLayers = useLayers((state) => state.setLayers);
    const layers = useLayers((state) => state.layers);
    const { sendRequest } = useFetchHelper();
    const liRef = useRef(null);

    return (
        <li
            ref={liRef}
            tabIndex={0}
            className={
                layers.MENU?.content.refElement === liRef.current
                    ? styles.liContainer + " " + styles.active
                    : styles.liContainer
            }
            onClick={() => {
                if (!["all", "online"].includes(content)) return;

                sendRequest({
                    query: "CHANNEL_CREATE",
                    data: { recipients: [user.id] },
                });
            }}
            onContextMenu={(e) => {
                e.preventDefault();
                setLayers({
                    settings: {
                        type: "MENU",
                        event: e,
                    },
                    content: {
                        type: "USER",
                        user: user,
                        refElement: liRef.current,
                    },
                });
            }}
            onMouseEnter={() => {
                if (layers.MENU?.content.refElement && layers.MENU?.content.user !== user) {
                    setLayers({
                        settings: {
                            type: "MENU",
                            setNull: true,
                        },
                    });
                }
            }}
            onKeyDown={(e) => {
                if (e.key === "Enter") {
                    if (!["all", "online"].includes(content)) return;

                    sendRequest({
                        query: "CHANNEL_CREATE",
                        data: { recipients: [user.id] },
                    });
                } else if (e.key === "Enter" && e.shiftKey) {
                    setLayers({
                        settings: {
                            type: "MENU",
                            event: e,
                        },
                        content: {
                            type: "USER",
                            user: user,
                            refElement: liRef.current,
                        },
                    });
                }
            }}
        >
            <div className={styles.li}>
                <div className={styles.userInfo}>
                    <div className={styles.avatarWrapper}>
                        <Avatar
                            src={user.avatar}
                            alt={user.username}
                            size={32}
                            status={content !== "pending" && content !== "blocked" && user.status}
                        />
                    </div>

                    <div className={styles.text}>
                        <div className={styles.usernames}>
                            <p>{user.displayName}</p>
                            <p>{user.username}</p>
                        </div>

                        <p className={styles.textStatus}>
                            <span>
                                {user?.req === "Sent"
                                    ? "Outgoing Friend Request"
                                    : user?.req === "Received"
                                    ? "Incoming Friend Request"
                                    : content === "blocked"
                                    ? "Blocked"
                                    : user.customStatus
                                    ? user.customStatus
                                    : translateCap(user.status)}
                            </span>
                        </p>
                    </div>
                </div>

                <div className={styles.actions}>
                    {(content === "all" || content === "online") && (
                        <>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    sendRequest({
                                        query: "CHANNEL_CREATE",
                                        data: { recipients: [user.id] },
                                    });
                                }}
                                onMouseEnter={(e) => {
                                    setTooltip({
                                        text: "Message",
                                        element: e.currentTarget,
                                        gap: 3,
                                    });
                                }}
                                onMouseLeave={() => setTooltip(null)}
                                onFocus={(e) => {
                                    setTooltip({
                                        text: "Message",
                                        element: e.currentTarget,
                                        gap: 3,
                                    });
                                }}
                                onBlur={() => setTooltip(null)}
                            >
                                <Icon
                                    name="message"
                                    size={20}
                                />
                            </button>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setLayers({
                                        settings: {
                                            type: "MENU",
                                            event: e,
                                        },
                                        content: {
                                            type: "USER_SMALL",
                                            user: user,
                                            userlist: true,
                                            refElement: liRef.current,
                                        },
                                    });
                                }}
                                onMouseEnter={(e) => {
                                    setTooltip({
                                        text: "More",
                                        element: e.currentTarget,
                                        gap: 3,
                                    });
                                }}
                                onMouseLeave={() => setTooltip(null)}
                                onFocus={(e) => {
                                    setTooltip({
                                        text: "More",
                                        element: e.currentTarget,
                                        gap: 3,
                                    });
                                }}
                                onBlur={() => setTooltip(null)}
                            >
                                <Icon
                                    name="more"
                                    size={20}
                                />
                            </button>
                        </>
                    )}

                    {content === "pending" && (
                        <>
                            {user.req === "Received" && (
                                <button
                                    className={styles.green}
                                    onClick={async (e) => {
                                        e.stopPropagation();
                                        sendRequest({
                                            query: "ADD_FRIEND",
                                            data: { username: user.username },
                                        });
                                    }}
                                    onMouseEnter={(e) => {
                                        setTooltip({
                                            text: "Accept",
                                            element: e.currentTarget,
                                            gap: 3,
                                        });
                                    }}
                                    onMouseLeave={() => setTooltip(null)}
                                    onFocus={(e) => {
                                        setTooltip({
                                            text: "Accept",
                                            element: e.currentTarget,
                                            gap: 3,
                                        });
                                    }}
                                    onBlur={() => setTooltip(null)}
                                >
                                    <Icon
                                        name="checkmark"
                                        size={20}
                                    />
                                </button>
                            )}

                            <button
                                className={styles.red}
                                onClick={async (e) => {
                                    e.stopPropagation();
                                    sendRequest({
                                        query: "REMOVE_FRIEND",
                                        data: {
                                            username: user.username,
                                        },
                                    });
                                }}
                                onMouseEnter={(e) => {
                                    setTooltip({
                                        text: user.req === "Sent" ? "Cancel" : "Ignore",
                                        element: e.currentTarget,
                                        gap: 3,
                                    });
                                }}
                                onMouseLeave={() => setTooltip(null)}
                                onFocus={(e) => {
                                    setTooltip({
                                        text: user.req === "Sent" ? "Cancel" : "Ignore",
                                        element: e.currentTarget,
                                        gap: 3,
                                    });
                                }}
                                onBlur={() => setTooltip(null)}
                            >
                                <Icon
                                    name="cancel"
                                    size={20}
                                />
                            </button>
                        </>
                    )}

                    {content === "blocked" && (
                        <button
                            className={styles.red}
                            onClick={async (e) => {
                                e.stopPropagation();
                                sendRequest({
                                    query: "UNBLOCK_USER",
                                    params: { userId: user.id },
                                });
                            }}
                            onMouseEnter={(e) => {
                                setTooltip({
                                    text: "Unblock",
                                    element: e.currentTarget,
                                    gap: 3,
                                });
                            }}
                            onMouseLeave={() => setTooltip(null)}
                            onFocus={(e) => {
                                setTooltip({
                                    text: "Unblock",
                                    element: e.currentTarget,
                                    gap: 3,
                                });
                            }}
                            onBlur={() => setTooltip(null)}
                        >
                            <Icon
                                name="unblock"
                                size={20}
                            />
                        </button>
                    )}
                </div>
            </div>
        </li>
    );
};
