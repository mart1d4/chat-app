"use client";

import { TooltipContent, TooltipTrigger, Tooltip } from "../Layers/Tooltip/Tooltip";
import useFetchHelper from "@/hooks/useFetchHelper";
import { translateCap } from "@/lib/strings";
import styles from "./UserItem.module.css";
import { Avatar, Icon } from "@components";
import { useLayers } from "@/store";
import { useRef } from "react";

export function UserItem({ content, user }) {
    const { sendRequest } = useFetchHelper();
    const liRef = useRef(null);

    return (
        <li
            ref={liRef}
            tabIndex={0}
            // className={
            //     layers.MENU?.content.refElement === liRef.current
            //         ? styles.liContainer + " " + styles.active
            //         : styles.liContainer
            // }
            className={styles.liContainer}
            onClick={() => {
                if (!["all", "online"].includes(content)) return;

                sendRequest({
                    query: "CHANNEL_CREATE",
                    body: { recipients: [user.id] },
                });
            }}
            onContextMenu={(e) => {
                e.preventDefault();
                // setLayers({
                //     settings: {
                //         type: "MENU",
                //         event: e,
                //     },
                //     content: {
                //         type: "USER",
                //         user: user,
                //         refElement: liRef.current,
                //     },
                // });
            }}
            onMouseEnter={() => {
                // if (layers.MENU?.content.refElement && layers.MENU?.content.user !== user) {
                //     setLayers({
                //         settings: {
                //             type: "MENU",
                //             setNull: true,
                //         },
                //     });
                // }
            }}
            onKeyDown={(e) => {
                if (e.key === "Enter") {
                    if (!["all", "online"].includes(content)) return;

                    sendRequest({
                        query: "CHANNEL_CREATE",
                        body: { recipients: [user.id] },
                    });
                } else if (e.key === "Enter" && e.shiftKey) {
                    // setLayers({
                    //     settings: {
                    //         type: "MENU",
                    //         event: e,
                    //     },
                    //     content: {
                    //         type: "USER",
                    //         user: user,
                    //         refElement: liRef.current,
                    //     },
                    // });
                }
            }}
        >
            <div className={styles.li}>
                <div className={styles.userInfo}>
                    <div className={styles.avatarWrapper}>
                        <Avatar
                            src={user.avatar}
                            alt={user.username}
                            type="avatars"
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
                            <Tooltip>
                                <TooltipTrigger>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            sendRequest({
                                                query: "CHANNEL_CREATE",
                                                body: { recipients: [user.id] },
                                            });
                                        }}
                                    >
                                        <Icon
                                            name="message"
                                            size={20}
                                        />
                                    </button>
                                </TooltipTrigger>

                                <TooltipContent>Message</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            // setLayers({
                                            //     settings: { type: "MENU", event: e },
                                            //     content: {
                                            //         type: "USER_SMALL",
                                            //         user: user,
                                            //         userlist: true,
                                            //         refElement: liRef.current,
                                            //     },
                                            // });
                                        }}
                                    >
                                        <Icon
                                            name="more"
                                            size={20}
                                        />
                                    </button>
                                </TooltipTrigger>

                                <TooltipContent>More</TooltipContent>
                            </Tooltip>
                        </>
                    )}

                    {content === "pending" && (
                        <>
                            {user.req === "Received" && (
                                <Tooltip>
                                    <TooltipTrigger>
                                        <button
                                            className={styles.green}
                                            onClick={async (e) => {
                                                e.stopPropagation();
                                                sendRequest({
                                                    query: "ADD_FRIEND",
                                                    body: { username: user.username },
                                                });
                                            }}
                                        >
                                            <Icon
                                                name="checkmark"
                                                size={20}
                                            />
                                        </button>
                                    </TooltipTrigger>

                                    <TooltipContent>Accept</TooltipContent>
                                </Tooltip>
                            )}

                            <Tooltip>
                                <TooltipTrigger>
                                    <button
                                        className={styles.red}
                                        onClick={async (e) => {
                                            e.stopPropagation();
                                            sendRequest({
                                                query: "REMOVE_FRIEND",
                                                body: {
                                                    username: user.username,
                                                },
                                            });
                                        }}
                                    >
                                        <Icon
                                            name="cancel"
                                            size={20}
                                        />
                                    </button>
                                </TooltipTrigger>

                                <TooltipContent>
                                    {user.req === "Sent" ? "Cancel" : "Ignore"}
                                </TooltipContent>
                            </Tooltip>
                        </>
                    )}

                    {content === "blocked" && (
                        <Tooltip>
                            <TooltipTrigger>
                                <button
                                    className={styles.red}
                                    onClick={async (e) => {
                                        e.stopPropagation();
                                        sendRequest({
                                            query: "UNBLOCK_USER",
                                            params: { userId: user.id },
                                        });
                                    }}
                                >
                                    <Icon
                                        name="unblock"
                                        size={20}
                                    />
                                </button>
                            </TooltipTrigger>

                            <TooltipContent>Unblock</TooltipContent>
                        </Tooltip>
                    )}
                </div>
            </div>
        </li>
    );
}
