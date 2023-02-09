import { useState } from "react";
import { motion } from "framer-motion";
import styles from "./EmojiPicker.module.css";

const emojisPos = [
    { x: 0, y: 0 }, { x: 0, y: -22 }, { x: 0, y: -44 }, { x: 0, y: -66 }, { x: 0, y: -88 },
    { x: -22, y: 0 }, { x: -22, y: -22 }, { x: -22, y: -44 }, { x: -22, y: -66 }, { x: -22, y: -88 },
    { x: -44, y: 0 }, { x: -44, y: -22 }, { x: -44, y: -44 }, { x: -44, y: -66 }, { x: -44, y: -88 },
    { x: -66, y: 0 }, { x: -66, y: -22 }, { x: -66, y: -44 }, { x: -66, y: -66 }, { x: -66, y: -88 },
    { x: -88, y: 0 }, { x: -88, y: -22 }, { x: -88, y: -44 }, { x: -88, y: -66 }, { x: -88, y: -88 },
    { x: -110, y: 0 }, { x: -110, y: -22 }, { x: -110, y: -44 }, { x: -110, y: -66 }, { x: -110, y: -88 },
    { x: -132, y: 0 }, { x: -132, y: -22 }, { x: -132, y: -44 }, { x: -132, y: -66 },
    { x: -154, y: 0 }, { x: -154, y: -22 }, { x: -154, y: -44 }, { x: -154, y: -66 },
    { x: -176, y: 0 }, { x: -176, y: -22 }, { x: -176, y: -44 }, { x: -176, y: -66 },
    { x: -198, y: 0 }, { x: -198, y: -22 }, { x: -198, y: -44 }, { x: -198, y: -66 },
    { x: -220, y: 0 }, { x: -220, y: -22 }, { x: -220, y: -44 }, { x: -220, y: -66 },
];

const scale = {
    hover: {
        scale: 1.15,
        transition: {
            duration: 0.1,
            ease: "easeInOut",
        }
    }
};

const EmojiPicker = () => {
    const [emojisPosIndex, setEmojisPosIndex] = useState(0);

    return (
        <motion.button
            onMouseEnter={() => setEmojisPosIndex(
                Math.floor(Math.random() * emojisPos.length)
            )}
            className={styles.buttonContainer}
            whileHover="hover"
        >
            <div className={styles.button}>
                <motion.div
                    className={styles.emoji}
                    style={{
                        backgroundPosition:
                            `${emojisPos[emojisPosIndex].x}px ${emojisPos[emojisPosIndex].y}px`
                    }}
                    variants={scale}
                >
                </motion.div>
            </div>
        </motion.button>
    );
}

export default EmojiPicker;
