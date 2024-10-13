"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "../Layers/Tooltip/Tooltip";
import { Avatar, Icon, Popover, PopoverContent, PopoverTrigger, UserCard } from "@components";
import styles from "./UserItem.module.css";
import { useRef } from "react";

export function UserItem({ user, channel, offline, isOwner }) {
    const liRef = useRef(null);

    return (
        <Popover placement="left-start">
            <PopoverTrigger asChild>
                <li
                    ref={liRef}
                    tabIndex={0}
                    className={styles.liContainer}
                    onContextMenu={(e) => {
                        e.preventDefault();
                        // setLayers({
                        //     settings: {
                        //         type: "MENU",
                        //         event: e,
                        //     },
                        //     content: {
                        //         type: "USER_GROUP",
                        //         user: user,
                        //         channel: channel,
                        //     },
                        // });
                    }}
                    style={
                        {
                            // opacity: offline && layers.USER_CARD?.settings.element !== liRef.current ? 0.3 : 1,
                            // backgroundColor:
                            //     layers.USER_CARD?.settings.element === liRef.current
                            //         ? "var(--background-5)"
                            //         : "",
                            // color:
                            //     layers.USER_CARD?.settings.element === liRef.current
                            //         ? "var(--foreground-2)"
                            //         : "",
                        }
                    }
                >
                    <div className={styles.liWrapper}>
                        <div className={styles.link}>
                            <div className={styles.layout}>
                                <div className={styles.layoutAvatar}>
                                    <div>
                                        <Avatar
                                            src={user.avatar}
                                            alt={`${user.username}'s avatar`}
                                            type="avatars"
                                            size={32}
                                            status={offline ? undefined : user.status}
                                            tooltip={true}
                                        />
                                    </div>
                                </div>

                                <div className={styles.layoutContent}>
                                    <div className={styles.contentName}>
                                        <div>{user.displayName}</div>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                {isOwner && (
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 24 24"
                                                        width="14"
                                                        height="14"
                                                        fill="none"
                                                    >
                                                        <path
                                                            fill="currentColor"
                                                            d="M5 18a1 1 0 0 0-1 1 3 3 0 0 0 3 3h10a3 3 0 0 0 3-3 1 1 0 0 0-1-1H5ZM3.04 7.76a1 1 0 0 0-1.52 1.15l2.25 6.42a1 1 0 0 0 .94.67h14.55a1 1 0 0 0 .95-.71l1.94-6.45a1 1 0 0 0-1.55-1.1l-4.11 3-3.55-5.33.82-.82a.83.83 0 0 0 0-1.18l-1.17-1.17a.83.83 0 0 0-1.18 0l-1.17 1.17a.83.83 0 0 0 0 1.18l.82.82-3.61 5.42-4.41-3.07Z"
                                                        />
                                                    </svg>
                                                )}
                                            </TooltipTrigger>

                                            <TooltipContent>
                                                {channel.guildId ? "Server" : "Group"} Owner
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>

                                    {user?.customStatus && (
                                        <div className={styles.contentStatus}>
                                            {user.customStatus}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </li>
            </PopoverTrigger>

            <PopoverContent>
                <UserCard
                    user={user}
                    animate
                />
            </PopoverContent>
        </Popover>
    );
}
