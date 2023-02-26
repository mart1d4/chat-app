import { useState, useRef, useMemo } from "react";
import styles from "./TextArea.module.css";
import { EmojiPicker, Icon, FilePreview } from "../";
import { v4 as uuidv4 } from "uuid";
import useUserData from "../../hooks/useUserData";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

const TextArea = ({ friend, userBlocked }) => {
    const [message, setMessage] = useState("");
    const [files, setFiles] = useState([]);
    const [friendTyping, setFriendTyping] = useState(false);
    const [error, setError] = useState(null);

    const textAreaRef = useRef(null);
    const { blocked, setBlocked } = useUserData();
    const axiosPrivate = useAxiosPrivate();

    const unblockUser = async () => {
        const response = await axiosPrivate.post(
            `/users/${friend._id}`,
        );

        if (!response.data.success) {
            setError(response.data.message);
        } else if (response.data.success) {
            setBlocked(blocked.filter((blocked) => blocked._id.toString() !== friend._id));
        } else {
            setError("An error occurred.");
        }
    };

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

    const textContainer = useMemo(() => (
        <div
            className={styles.textContainer}
            style={{ height: textAreaRef?.current?.scrollHeight || 44 }}
        >
            <div>
                {message.length === 0 && (
                    <div className={styles.textContainerPlaceholder}>
                        Message @{friend?.username || ""}
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
                            console.log("Send message: ", message);
                            setMessage("");
                            e.target.innerText = "";
                        }
                    }}
                />
            </div>
        </div>
    ), [message, friend]);

    const imageList = useMemo(() => (
        <ul className={styles.filesList}>
            {files?.map((file) => (
                <FilePreview
                    key={uuidv4()}
                    file={file}
                    setFiles={setFiles}
                />
            ))}
        </ul>
    ), [files]);

    const caracterCounter = useMemo(() => (
        <div className={styles.counterContainer}>
            <span
                style={{
                    color: message.length > 4000
                        ? "var(--error-1)"
                        : "var(--foreground-3)"
                }}
            >
                {message.length}
            </span>/4000
        </div>
    ), [message]);

    if (!userBlocked) return (
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

                {caracterCounter}
            </div>

            <div className={styles.textArea}>
                <div className={styles.scrollableContainer}>
                    {files.length > 0 && (
                        <>
                            {imageList}
                            <div className={styles.formDivider} />
                        </>
                    )}

                    <div className={styles.input}>
                        <div className={styles.attachWrapper}>
                            <input
                                type="file"
                                id="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => {
                                    const newFiles = Array.from(e.target.files);
                                    if (files.length + newFiles.length > 10) {
                                        setError("You can only attach up to 10 files");
                                        return;
                                    }
                                    setFiles(files.concat(newFiles).slice(0, 10));
                                }}
                                style={{ display: "none" }}
                            />

                            <button
                                onClick={(e) => e.preventDefault()}
                                onDoubleClick={(e) => {
                                    e.preventDefault();
                                    document.getElementById("file").click();
                                }}
                            >
                                <div>
                                    <Icon name="attach" />
                                </div>
                            </button>
                        </div>

                        {textContainer}

                        <div className={styles.toolsContainer}>
                            <button>
                                <Icon
                                    name="keyboard"
                                    size={30}
                                />
                            </button>
                            <button>
                                <Icon
                                    name="gif"
                                />
                            </button>
                            <EmojiPicker />
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );

    else return (
        <form className={styles.form}>
            <div className={styles.wrapperBlocked}>
                <div>
                    You cannot send messages to a user you have blocked.
                </div>

                <button
                    className="grey"
                    onClick={(e) => {
                        e.preventDefault();
                        unblockUser();
                    }}
                >
                    Unblock
                </button>
            </div>
        </form>
    );
}

export default TextArea;
