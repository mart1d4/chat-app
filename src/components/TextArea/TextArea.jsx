import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import styles from "./TextArea.module.css";

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
                                ? "var(--error-primary)"
                                : "var(--foreground-tertiary)",
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
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        width="24"
                                        height="24"
                                    >
                                        <path
                                            d="M12 2.00098C6.486 2.00098 2 6.48698 2 12.001C2 17.515 6.486 22.001 12 22.001C17.514 22.001 22 17.515 22 12.001C22 6.48698 17.514 2.00098 12 2.00098ZM17 13.001H13V17.001H11V13.001H7V11.001H11V7.00098H13V11.001H17V13.001Z"
                                        />
                                    </svg>
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
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        width="30"
                                        height="30"
                                    >
                                        <g
                                            fill="none"
                                            fillRule="evenodd"
                                        >
                                            <path
                                                d="m20 5h-16c-1.1 0-1.99.9-1.99 2l-.01 10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-10c0-1.1-.9-2-2-2zm-9 3h2v2h-2zm0 3h2v2h-2zm-3-3h2v2h-2zm0 3h2v2h-2zm-1 2h-2v-2h2zm0-3h-2v-2h2zm9 7h-8v-2h8zm0-4h-2v-2h2zm0-3h-2v-2h2zm3 3h-2v-2h2zm0-3h-2v-2h2z"
                                                fill={
                                                    hover === 1
                                                        ? "var(--foreground-secondary)"
                                                        : "var(--foreground-tertiary)"
                                                }
                                                fillRule="nonzero"
                                            />
                                            <path
                                                d="m0 0h24v24h-24zm0 0h24v24h-24z"
                                            />
                                        </g>
                                    </svg>
                                </div>
                            </button>
                            <button
                                onMouseEnter={() => setHover(2)}
                                onMouseLeave={() => setHover(null)}
                            >
                                <div className={styles.button}>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        width="24"
                                        height="24"
                                    >
                                        <path
                                            fill={
                                                hover === 2
                                                    ? "var(--foreground-secondary)"
                                                    : "var(--foreground-tertiary)"
                                            }
                                            d="M2 2C0.895431 2 0 2.89543 0 4V20C0 21.1046 0.89543 22 2 22H22C23.1046 22 24 21.1046 24 20V4C24 2.89543 23.1046 2 22 2H2ZM9.76445 11.448V15.48C8.90045 16.044 7.88045 16.356 6.74045 16.356C4.11245 16.356 2.66045 14.628 2.66045 12.072C2.66045 9.504 4.23245 7.764 6.78845 7.764C7.80845 7.764 8.66045 8.004 9.32045 8.376L9.04445 10.164C8.42045 9.768 7.68845 9.456 6.83645 9.456C5.40845 9.456 4.71245 10.512 4.71245 12.06C4.71245 13.62 5.43245 14.712 6.86045 14.712C7.31645 14.712 7.64045 14.616 7.97645 14.448V12.972H6.42845V11.448H9.76445ZM11.5481 7.92H13.6001V16.2H11.5481V7.92ZM20.4724 7.92V9.636H17.5564V11.328H19.8604V13.044H17.5564V16.2H15.5164V7.92H20.4724Z"
                                        />
                                    </svg>
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
