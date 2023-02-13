import { useEffect, useState, useCallback } from "react";
import styles from "./TextArea.module.css";
import { EmojiPicker, Icon, TextContainer, FilePreview } from "../";
import { v4 as uuidv4 } from "uuid";

const TextArea = ({ friend, sendMessage }) => {
    const [friendTyping, setFriendTyping] = useState(false);
    const [files, setFiles] = useState([]);
    const [error, setError] = useState(null);

    const changeFiles = useCallback((file) => {
        setFiles((files) => {
            return files.filter((f) => f !== file);
        });
    }, []);

    useEffect(() => {
        if (!files.length) return
        console.log(files);
    }, [files]);

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

                {/* <div className={styles.counterContainer}>
                    <span
                        style={{
                            color: message.length > 4000
                                ? "var(--error-1)"
                                : "var(--foreground-3)",
                        }}
                    >
                        {message.length}
                    </span>/4000
                </div> */}
            </div>

            <div className={styles.textArea}>
                <div className={styles.scrollableContainer}>
                    {files.length > 0 && (
                        <>
                            <ul className={styles.filesList}>
                                {files.map((file) => (
                                    <FilePreview
                                        key={uuidv4()}
                                        file={file}
                                        setFiles={changeFiles}
                                    />
                                ))}
                            </ul>

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

                        <TextContainer
                            username={friend?.username}
                            sendMessage={sendMessage}
                        />

                        <div className={styles.toolsContainer}>
                            <button>
                                <div className={styles.button}>
                                    <Icon
                                        name="keyboard"
                                        size={30}
                                    />
                                </div>
                            </button>
                            <button>
                                <div className={styles.button}>
                                    <Icon
                                        name="gif"
                                    />
                                </div>
                            </button>
                            <EmojiPicker />
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}

export default TextArea;
