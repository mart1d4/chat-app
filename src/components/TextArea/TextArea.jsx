import { useEffect, useState } from "react";
import styles from "./TextArea.module.css";
import { EmojiPicker, Icon, TextContainer, Tooltip } from "../";
import { v4 as uuidv4 } from "uuid";

const TextArea = ({ friend, sendMessage }) => {
    const [friendTyping, setFriendTyping] = useState(false);
    const [showTooltip, setShowTooltip] = useState(null);
    const [files, setFiles] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        console.log("Error: ", error);
    }, [error]);

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
                                    <li
                                        key={uuidv4()}
                                        className={styles.fileItem}
                                    >
                                        <div className={styles.fileItemContainer}>
                                            <div className={styles.image}>
                                                <img
                                                    src={URL.createObjectURL(file)}
                                                    alt="file"
                                                />
                                            </div>

                                            <div className={styles.fileName}>
                                                <div>
                                                    {file.name}
                                                </div>
                                            </div>
                                        </div>

                                        <div className={styles.fileMenu}>
                                            <div>
                                                <div>
                                                    <div
                                                        className={styles.fileMenuButton}
                                                        onMouseEnter={() => setShowTooltip(1)}
                                                        onMouseLeave={() => setShowTooltip(null)}
                                                    >
                                                        <Icon name="eye" size={20} />
                                                    </div>
                                                    <Tooltip show={showTooltip === 1}>
                                                        Spoiler Attachment
                                                    </Tooltip>
                                                </div>

                                                <div>
                                                    <div
                                                        className={styles.fileMenuButton}
                                                        onMouseEnter={() => setShowTooltip(2)}
                                                        onMouseLeave={() => setShowTooltip(null)}
                                                    >
                                                        <Icon name="edit" size={20} />
                                                    </div>
                                                    <Tooltip show={showTooltip === 2}>
                                                        Modify Attachment
                                                    </Tooltip>
                                                </div>

                                                <div>
                                                    <div
                                                        className={styles.fileMenuButton}
                                                        onMouseEnter={() => setShowTooltip(3)}
                                                        onMouseLeave={() => setShowTooltip(null)}
                                                        onClick={() => {
                                                            setFiles(files.filter((f) => f !== file));
                                                        }}
                                                    >
                                                        <Icon
                                                            name="delete"
                                                            size={20}
                                                            fill="var(--error-1)"
                                                        />
                                                    </div>
                                                    <Tooltip show={showTooltip === 3}>
                                                        Remove Attachment
                                                    </Tooltip>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
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
                                onClick={(e) => {
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
