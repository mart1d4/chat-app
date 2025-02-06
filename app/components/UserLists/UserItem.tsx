"use client";

import type { KnownUser, UnknownUser } from "@/type";
import useFetchHelper from "@/hooks/useFetchHelper";
import { getStatusLabel } from "@/lib/utils";
import { useRouter } from "next/navigation";
import styles from "./UserItem.module.css";
import { useData } from "@/store";
import { useState } from "react";
import {
    TooltipContent,
    TooltipTrigger,
    MenuTrigger,
    UserMenu,
    Tooltip,
    Avatar,
    Icon,
    Menu,
} from "@components";

type ContentType = "all" | "online" | "pending" | "blocked";

export function UserItem({
    content,
    user,
}: {
    content: ContentType;
    user: ContentType extends "blocked" ? UnknownUser : KnownUser & { req: string };
}) {
    const [loading, setLoading] = useState(false);

    const { channels } = useData();
    const { sendRequest } = useFetchHelper();
    const router = useRouter();

    const dmWithUser = channels.find((c) => {
        return c.recipients.length === 2 && c.recipients.find((r) => r.id === user.id);
    });

    async function messageUser() {
        if (loading || !["all", "online"].includes(content)) return;

        if (dmWithUser) {
            router.push(`/channels/me/${dmWithUser.id}`);
            return;
        }

        setLoading(true);

        try {
            await sendRequest({
                query: "CHANNEL_CREATE",
                body: { recipients: [user.id] },
            });
        } catch (error) {
            console.error(error);
        }

        setLoading(false);
    }

    return (
        <Menu
            openOnRightClick
            placement="right-start"
        >
            <MenuTrigger>
                <li
                    tabIndex={0}
                    onClick={messageUser}
                    className={styles.container}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            messageUser();
                        }
                    }}
                >
                    <div className={styles.li}>
                        <div className={styles.userInfo}>
                            <div className={styles.avatarWrapper}>
                                <Avatar
                                    size={32}
                                    type="user"
                                    alt={user.username}
                                    fileId={user.avatar}
                                    generateId={user.id}
                                    status={
                                        (content !== "pending" || user.req === "Received") &&
                                        content !== "blocked" &&
                                        user.status
                                    }
                                />
                            </div>

                            <div className={styles.text}>
                                <div className={styles.usernames}>
                                    <p>{user.displayName}</p>
                                    <p className={content === "blocked" ? styles.blocked : ""}>
                                        {user.username}
                                    </p>
                                </div>

                                <p className={styles.textStatus}>
                                    <span>
                                        {user.req === "Sent"
                                            ? "Outgoing Friend Request"
                                            : user.req === "Received"
                                            ? "Incoming Friend Request"
                                            : content === "blocked"
                                            ? "Blocked"
                                            : user.customStatus
                                            ? user.customStatus
                                            : getStatusLabel(user.status)}
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
                                                type="button"
                                                onClick={messageUser}
                                            >
                                                <Icon
                                                    size={20}
                                                    name="message"
                                                />
                                            </button>
                                        </TooltipTrigger>

                                        <TooltipContent>Message</TooltipContent>
                                    </Tooltip>

                                    <Menu
                                        openOnClick
                                        positionOnClick
                                        placement="right-start"
                                    >
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <MenuTrigger>
                                                    <button onClick={(e) => e.stopPropagation()}>
                                                        <Icon
                                                            size={20}
                                                            name="more"
                                                        />
                                                    </button>
                                                </MenuTrigger>
                                            </TooltipTrigger>

                                            <TooltipContent>More</TooltipContent>
                                        </Tooltip>

                                        <UserMenu
                                            user={user}
                                            type="small"
                                        />
                                    </Menu>
                                </>
                            )}

                            {content === "pending" && (
                                <>
                                    {user.req === "Received" && (
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <button
                                                    type="button"
                                                    className={styles.green}
                                                    onClick={async () => {
                                                        const { data } = await sendRequest({
                                                            query: "ADD_FRIEND",
                                                            body: { username: user.username },
                                                        });
                                                    }}
                                                >
                                                    <Icon
                                                        size={20}
                                                        name="checkmark"
                                                    />
                                                </button>
                                            </TooltipTrigger>

                                            <TooltipContent>Accept</TooltipContent>
                                        </Tooltip>
                                    )}

                                    <Tooltip>
                                        <TooltipTrigger>
                                            <button
                                                type="button"
                                                className={styles.red}
                                                onClick={async () => {
                                                    const { errors } = await sendRequest({
                                                        query: "REMOVE_FRIEND",
                                                        body: {
                                                            username: user.username,
                                                        },
                                                    });
                                                }}
                                            >
                                                <Icon
                                                    size={20}
                                                    name="cancel"
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
                                            type="button"
                                            className={styles.red}
                                            onClick={async () => {
                                                const { errors } = await sendRequest({
                                                    query: "UNBLOCK_USER",
                                                    params: { userId: user.id },
                                                });
                                            }}
                                        >
                                            <Icon
                                                size={20}
                                                name="unblock"
                                            />
                                        </button>
                                    </TooltipTrigger>

                                    <TooltipContent>Unblock</TooltipContent>
                                </Tooltip>
                            )}
                        </div>
                    </div>
                </li>
            </MenuTrigger>

            <UserMenu user={user} />
        </Menu>
    );
}
