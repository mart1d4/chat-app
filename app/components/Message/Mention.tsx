"use client";

import styles from "./Message.module.css";
import type { User } from "@/type";
import {
    PopoverContent,
    PopoverTrigger,
    TooltipContent,
    TooltipTrigger,
    UserCard,
    Tooltip,
    Popover,
    Avatar,
} from "@components";

export function UserMention({
    user,
    full,
    editor,
    fixed,
}: {
    user: User;
    full?: boolean;
    editor?: boolean;
    fixed?: boolean;
}) {
    // const userCardElement = layers.USER_CARD?.settings?.element;
    // const menuElement = layers.MENU?.settings?.element;

    const content = (
        <span
            className={
                full ? `${styles.mention} ${editor ? styles.editor : ""}` : styles.inlineMention
            }
            style={{ pointerEvents: fixed ? "none" : "auto" }}
            onContextMenu={() => {
                // setLayers({
                //     settings: { type: "MENU", event: e },
                //     content: { type: "USER", user },
                // });
            }}
        >
            {full && "@"}
            {user.displayName || "Unknown User"}
        </span>
    );

    if (editor) {
        return (
            <Tooltip
                delay={1000}
                avatar
            >
                <TooltipTrigger>{content}</TooltipTrigger>
                <TooltipContent>
                    <Avatar
                        size={16}
                        src={user.avatar}
                        alt={user.displayName}
                    />

                    <span>{user.displayName}</span>
                </TooltipContent>
            </Tooltip>
        );
    }

    return (
        <Popover placement="right-start">
            <PopoverTrigger asChild>{content}</PopoverTrigger>

            <PopoverContent>
                <UserCard user={user} />
            </PopoverContent>
        </Popover>
    );
}
