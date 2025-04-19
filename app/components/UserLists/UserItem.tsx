"use client";

import type { KnownUser, UnknownUser } from "@/type";
import { useRequests } from "@/hooks/useRequests";
import { getStatusLabel } from "@/lib/utils";
import styles from "./UserItem.module.css";
import {
    InteractiveElement,
    TooltipTrigger,
    TooltipContent,
    MenuTrigger,
    LoadingDots,
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
    user: ContentType extends "blocked" ? UnknownUser : KnownUser & { req: "Sent" | "Received" };
}) {
    const { createChannel, addFriend, removeFriend, unblockUser } = useRequests();

    return (
        <Menu
            openOnRightClick
            placement="right-start"
        >
            <UserMenu user={user} />

            <MenuTrigger>
                <InteractiveElement
                    className={styles.container}
                    onClick={() => {
                        if (content === "all" || content === "online") {
                            createChannel.send({ recipients: [user.id], isDM: true });
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
                                            <button type="button">
                                                {createChannel.isLoading ? (
                                                    <LoadingDots />
                                                ) : (
                                                    <Icon
                                                        size={20}
                                                        name="message"
                                                    />
                                                )}
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
                                                    onClick={() =>
                                                        addFriend.send({ username: user.username })
                                                    }
                                                >
                                                    {addFriend.isLoading ? (
                                                        <LoadingDots />
                                                    ) : (
                                                        <Icon
                                                            size={20}
                                                            name="checkmark"
                                                        />
                                                    )}
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
                                                onClick={() =>
                                                    removeFriend.send({ username: user.username })
                                                }
                                            >
                                                {removeFriend.isLoading ? (
                                                    <LoadingDots />
                                                ) : (
                                                    <Icon
                                                        size={20}
                                                        name="cancel"
                                                    />
                                                )}
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
                                            onClick={() => unblockUser.send({ userId: user.id })}
                                        >
                                            {unblockUser.isLoading ? (
                                                <LoadingDots />
                                            ) : (
                                                <Icon
                                                    size={20}
                                                    name="unblock"
                                                />
                                            )}
                                        </button>
                                    </TooltipTrigger>

                                    <TooltipContent>Unblock</TooltipContent>
                                </Tooltip>
                            )}
                        </div>
                    </div>
                </InteractiveElement>
            </MenuTrigger>
        </Menu>
    );
}
