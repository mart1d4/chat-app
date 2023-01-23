import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import styles from "./TextArea.module.css";
import { Icon } from "../../components";

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
            ease: "circInOut",
        }
    }
};

const TextArea = ({ friend, sendMessage }) => {
    const [message, setMessage] = useState("");
    const [hover, setHover] = useState(null);
    const [friendTyping, setFriendTyping] = useState(false);
    const [emojisPosIndex, setEmojisPosIndex] = useState(0);

    // useEffect(() => {
    //     const handleTyping = (e) => {
    //         if (document.activeElement === textAreaRef.current) return;
    //         if (typeof e.key === "string") {
    //             textAreaRef.current.innerText += e.key;
    //             setMessage(textAreaRef.current.innerText);
    //             moveCursorToEnd();
    //         } else if (e.key === "Backspace") {
    //             textAreaRef.current.innerText = textAreaRef.current.innerText.slice(
    //                 0,
    //                 -1
    //             );
    //             setMessage(textAreaRef.current.innerText);
    //             moveCursorToEnd();
    //         } else if (e.key === "Enter") {
    //             textAreaRef.current.innerText += "\n";
    //             setMessage(textAreaRef.current.innerText);
    //             moveCursorToEnd();
    //         }
    //     };

    //     window.addEventListener("keydown", handleTyping);

    //     return () => {
    //         window.removeEventListener("keydown", handleTyping);
    //     };
    // }, []);

    const textAreaRef = useRef(null);

    const moveCursorToEnd = () => {
        textAreaRef.current.focus();
        if (
            typeof window.getSelection != "undefined" &&
            typeof document.createRange != "undefined"
        ) {
            const range = document.createRange();
            range.selectNodeContents(textAreaRef.current);
            range.collapse(false);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        } else if (typeof document.body.createTextRange != "undefined") {
            const textRange = document.body.createTextRange();
            textRange.moveToElementText(textAreaRef.current);
            textRange.collapse(false);
            textRange.select();
        }
    };

    return (
        <form className={styles.form}>
            <div className={styles.bottomForm}>
                <div className={styles.typingContainer}>
                    {friendTyping && (
                        <>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24.5"
                                height="7"
                            >
                                <circle cx="3.5" cy="3.5" r="3.5" />
                                <circle cx="12.25" cy="3.5" r="3.5" />
                                <circle cx="21" cy="3.5" r="3.5" />
                            </svg>
                            <span>
                                <strong>{friend?.username}</strong> is typing...
                            </span>
                        </>
                    )}
                </div>

                <div className={styles.counterContainer}>
                    <span
                        style={{
                            color: message.length > 4000
                                ? "var(--error-1)"
                                : "var(--foreground-3)",
                        }}
                    >
                        {message.length}
                    </span>/4000
                </div>
            </div>

            <div className={styles.textArea}>
                <div className={styles.scrollableContainer}>
                    <div className={styles.input}>
                        <div className={styles.attachWrapper}>
                            <button>
                                <div>
                                    <Icon name="attach" />
                                </div>
                            </button>
                        </div>

                        <div
                            className={styles.textContainer}
                            style={{
                                height: textAreaRef?.current?.scrollHeight || 44,
                            }}
                        >
                            <div>
                                {message.length === 0 && (
                                    <div className={styles.textContainerPlaceholder}>
                                        Message @{friend?.username || "username"}
                                    </div>
                                )}

                                <div
                                    ref={textAreaRef}
                                    className={styles.textContainerInner}
                                    role="textarea"
                                    spellCheck="true"
                                    autoCorrect="off"
                                    aria-multiline="true"
                                    aria-label={`Message @${friend?.username || "username"}`}
                                    aria-autocomplete="list"
                                    contentEditable="true"
                                    onInput={(e) => {
                                        const text = e.target.innerText.toString();
                                        e.target.innerText = text;
                                        setMessage(text);
                                        moveCursorToEnd();
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && e.shiftKey) {
                                            e.preventDefault();
                                            e.target.innerText += "\n";
                                            setMessage(e.target.innerText);
                                            moveCursorToEnd();
                                        } else if (e.key === "Enter") {
                                            e.preventDefault();
                                            sendMessage(message);
                                            setMessage("");
                                            e.target.innerText = "";
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        <div className={styles.toolsContainer}>
                            <button
                                onMouseEnter={() => setHover(1)}
                                onMouseLeave={() => setHover(null)}
                            >
                                <div className={styles.button}>
                                    <Icon
                                        name="keyboard"
                                        size={30}
                                        fill={hover === 1 && "var(--foreground-2)"}
                                    />
                                </div>
                            </button>
                            <button
                                onMouseEnter={() => setHover(2)}
                                onMouseLeave={() => setHover(null)}
                            >
                                <div className={styles.button}>
                                    <Icon
                                        name="gif"
                                        fill={hover === 2 && "var(--foreground-2)"}
                                    />
                                </div>
                            </button>
                            <motion.button
                                onMouseEnter={() => {
                                    setHover(3)
                                    setEmojisPosIndex(Math.floor(Math.random() * emojisPos.length))
                                }}
                                onMouseLeave={() => setHover(null)}
                                whileHover="hover"
                            >
                                <div className={styles.button}>
                                    <motion.div
                                        className={styles.emojiButton}
                                        style={{
                                            filter: hover === 3 ? "grayscale(0%)" : "grayscale(100%)",
                                            backgroundPosition: `${emojisPos[emojisPosIndex].x}px ${emojisPos[emojisPosIndex].y}px`
                                        }}
                                        variants={scale}
                                    >
                                    </motion.div>
                                </div>
                            </motion.button>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}

export default TextArea;
