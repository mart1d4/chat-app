"use client";

import type { ChannelRecipient, DMChannel, GuildChannel, GuildMember } from "@/type";
import styles from "./UserItem.module.css";
import {
    PopoverContent,
    PopoverTrigger,
    TooltipContent,
    TooltipTrigger,
    MenuTrigger,
    UserCard,
    UserMenu,
    Popover,
    Tooltip,
    Avatar,
    Menu,
} from "@components";
import { useMemo, useRef } from "react";

export function UserItem({
    user,
    channel,
    offline,
    isOwner,
    isGuild,
}: {
    user: GuildMember | ChannelRecipient;
    channel: DMChannel | GuildChannel;
    offline?: boolean;
    isOwner?: boolean;
    isGuild?: boolean;
}) {
    const statusRef = useRef<HTMLDivElement>(null);
    const nameRef = useRef<HTMLDivElement>(null);

    const statusBigger = useMemo(() => {
        if (!statusRef.current) return false;
        return statusRef.current.scrollWidth > 155;
    }, [statusRef.current]);

    const nameBigger = useMemo(() => {
        if (!nameRef.current) return false;
        return nameRef.current.scrollWidth > 155;
    }, [nameRef.current]);

    return (
        <Menu
            positionOnClick
            openOnRightClick
            placement="right-start"
        >
            <Popover placement="left-start">
                <PopoverTrigger asChild>
                    <MenuTrigger>
                        <li
                            tabIndex={0}
                            className={styles.liContainer}
                            style={{ opacity: offline ? 0.3 : "" }}
                        >
                            <div className={styles.liWrapper}>
                                <div className={styles.link}>
                                    <div className={styles.layout}>
                                        <div className={styles.layoutAvatar}>
                                            <div>
                                                <Avatar
                                                    size={32}
                                                    type="user"
                                                    showStatusTooltip
                                                    fileId={user.avatar}
                                                    generateId={user.id}
                                                    alt={`${user.displayName}'s avatar`}
                                                    status={offline ? undefined : user.status}
                                                />
                                            </div>
                                        </div>

                                        <div className={styles.layoutContent}>
                                            <div className={styles.contentName}>
                                                <Tooltip
                                                    delay={750}
                                                    show={nameBigger}
                                                >
                                                    <TooltipTrigger>
                                                        <div ref={nameRef}>{user.displayName}</div>
                                                    </TooltipTrigger>

                                                    <TooltipContent>
                                                        {user.displayName}
                                                    </TooltipContent>
                                                </Tooltip>

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
                                                        {isGuild ? "Server" : "Group"} Owner
                                                    </TooltipContent>
                                                </Tooltip>
                                            </div>

                                            {"customStatus" in user && (
                                                <Tooltip
                                                    delay={750}
                                                    show={statusBigger}
                                                >
                                                    <TooltipTrigger>
                                                        <div
                                                            ref={statusRef}
                                                            className={styles.contentStatus}
                                                        >
                                                            {user.customStatus}
                                                        </div>
                                                    </TooltipTrigger>

                                                    <TooltipContent>
                                                        {user.customStatus}
                                                    </TooltipContent>
                                                </Tooltip>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </li>
                    </MenuTrigger>
                </PopoverTrigger>

                <PopoverContent>
                    <UserCard initUser={user} />
                </PopoverContent>

                <UserMenu
                    user={user}
                    type="author"
                    channelId={channel.id}
                    channelType={channel.type}
                    channelOwnerId={"ownerId" in channel ? channel.ownerId : undefined}
                />
            </Popover>
        </Menu>
    );
}
