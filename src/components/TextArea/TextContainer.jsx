import { useRef, useState } from "react";
import styles from "./TextArea.module.css";

const TextContainer = ({ username, sendMessage }) => {
    const [message, setMessage] = useState("");

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
        <div
            className={styles.textContainer}
            style={{ height: textAreaRef?.current?.scrollHeight || 44 }}
        >
            <div>
                {message.length === 0 && (
                    <div className={styles.textContainerPlaceholder}>
                        Message {("@" + username) || "Loading"}
                    </div>
                )}

                <div
                    ref={textAreaRef}
                    className={styles.textContainerInner}
                    role="textarea"
                    spellCheck="true"
                    autoCorrect="off"
                    aria-multiline="true"
                    aria-label={`Message @${username || "username"}`}
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
    );
}

export default TextContainer;
