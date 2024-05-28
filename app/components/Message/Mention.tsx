"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "../Layers/Tooltip/Tooltip";
import type { Users } from "@/lib/db/types";
import styles from "./Message.module.css";
import { Avatar } from "../Avatar/Avatar";
import { useLayers } from "@/store";

export function UserMention({
    user,
    full,
    editor,
    fixed,
}: {
    user: Users;
    full?: boolean;
    editor?: boolean;
    fixed?: boolean;
}) {
    const setLayers = useLayers((state) => state.setLayers);
    const layers = useLayers((state) => state.layers);

    const userCardElement = layers.USER_CARD?.settings?.element;
    const menuElement = layers.MENU?.settings?.element;

    const content = (
        <span
            className={
                full ? `${styles.mention} ${editor ? styles.editor : ""}` : styles.inlineMention
            }
            style={{ pointerEvents: fixed ? "none" : "auto" }}
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();

                if (userCardElement === e.currentTarget || editor || fixed) {
                    return;
                }

                setLayers({
                    settings: {
                        type: "USER_CARD",
                        element: e.currentTarget,
                        firstSide: "RIGHT",
                        gap: 10,
                    },
                    content: {
                        user: user,
                    },
                });
            }}
            onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();

                if (menuElement === e.currentTarget || editor || fixed) {
                    return;
                }

                setLayers({
                    settings: { type: "MENU", event: e },
                    content: { type: "USER", user },
                });
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
                        type="avatars"
                        src={user.avatar}
                        alt={user.displayName}
                    />

                    <span>{user.displayName}</span>
                </TooltipContent>
            </Tooltip>
        );
    }

    return content;
}
