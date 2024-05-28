"use client";

import styles from "./TextArea.module.css";
import { emojiPos } from "@/lib/assets";
import { useState } from "react";

export function EmojiPicker() {
    const [posIndex, setPosIndex] = useState(Math.floor(Math.random() * emojiPos.length));

    return (
        <button
            onMouseEnter={() => setPosIndex(Math.floor(Math.random() * emojiPos.length))}
            onClick={(e) => e.preventDefault()}
            className={styles.buttonContainer}
        >
            <div
                className={styles.emoji}
                style={{
                    backgroundPosition: `${emojiPos[posIndex].x}px ${emojiPos[posIndex].y}px`,
                }}
            />
        </button>
    );
}
