"use client";

import styles from "./Message.module.css";
import { useLayers } from "@/lib/store";

export function UserMention({
    user,
    full,
    editor,
}: {
    user: Partial<UserTable>;
    full?: boolean;
    editor?: boolean;
}) {
    const setLayers = useLayers((state) => state.setLayers);
    const layers = useLayers((state) => state.layers);

    return (
        <span
            className={
                full ? `${styles.mention} ${editor ? styles.editor : ""}` : styles.inlineMention
            }
            onClick={(e) => {
                if (layers.USER_CARD?.settings?.element === e.currentTarget || editor) {
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

                if (layers.MENU?.settings?.element === e.currentTarget || editor) {
                    return;
                }

                setLayers({
                    settings: {
                        type: "MENU",
                        event: e,
                    },
                    content: {
                        type: "USER",
                        user: user,
                    },
                });
            }}
        >
            {full && "@"}
            {user.username || "Unknown User"}
        </span>
    );
}
