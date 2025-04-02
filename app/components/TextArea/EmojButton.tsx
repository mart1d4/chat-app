"use client";

import styles from "./TextArea.module.css";
import { emojiPos } from "@/lib/utils";
import { useState } from "react";

export function EmojiButton({
    open,
    setOpen,
}: {
    open: boolean;
    setOpen: (open: boolean) => void;
}) {
    const [posIndex, setPosIndex] = useState(Math.floor(Math.random() * emojiPos.length));
    const position = emojiPos[posIndex];

    return (
        <button
            type="button"
            onClick={() => setOpen(!open)}
            className={styles.buttonContainer}
            data-state={open ? "open" : "closed"}
            onMouseEnter={() => {
                if (!open) {
                    setPosIndex(Math.floor(Math.random() * emojiPos.length));
                }
            }}
        >
            <div
                className={styles.emoji}
                style={{ backgroundPosition: `${position.x}px ${position.y}px` }}
            />
        </button>
    );
}
