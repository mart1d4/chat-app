import { useMemo, useState } from "react";
import styles from "./FilePreview.module.css";
import { Icon, Tooltip } from "../";

const FilePreview = ({ file, setFiles }) => {
    const [showTooltip, setShowTooltip] = useState(null);

    return useMemo(() => (
        <li className={styles.fileItem}>
            <div className={styles.fileItemContainer}>
                <div className={styles.image}>
                    <img
                        src={URL.createObjectURL(file)}
                        alt="File Preview"
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
                            className={styles.fileMenuButton + " " + styles.danger}
                            onMouseEnter={() => setShowTooltip(3)}
                            onMouseLeave={() => setShowTooltip(null)}
                            onClick={() => setFiles(file)}
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
    ), []);
};

export default FilePreview;
