"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "../Layers/Tooltip/Tooltip";
import { useState, type Dispatch, type SetStateAction } from "react";
import { isFileImage } from "@/lib/verifications";
import styles from "./TextArea.module.css";
import type { Attachment } from "@/type";
import { Icon } from "../Icon/Icon";
import { useLayers } from "@/store";

export function FilePreview({
    attachment,
    setAttachments,
}: {
    attachment: Attachment;
    setAttachments: Dispatch<SetStateAction<Attachment[]>>;
}) {
    const [hideSpoiler, setHideSpoiler] = useState(false);

    const spoiler = attachment.spoiler;
    const isImage = isFileImage(attachment.type);

    function handleFileChange({ name, spoiler, description }: Partial<Attachment>) {
        setAttachments((prev) =>
            prev.map((a) => {
                if (a.id === attachment.id) {
                    return {
                        ...a,
                        name: name ?? a.name,
                        spoiler: spoiler ?? a.spoiler,
                        description: description ?? a.description,
                    };
                }
                return a;
            })
        );
    }

    return (
        <li className={styles.fileItem}>
            <div className={styles.fileItemContainer}>
                <div
                    className={styles.image}
                    style={{
                        backgroundColor: spoiler && !hideSpoiler ? "var(--background-dark-3)" : "",
                        cursor: spoiler && !hideSpoiler ? "pointer" : "default",
                    }}
                    onClick={() => spoiler && setHideSpoiler(true)}
                >
                    {spoiler && !hideSpoiler && <div className={styles.spoilerButton}>Spoiler</div>}

                    <img
                        src={isImage ? attachment.url : `/assets/system/file_text.svg`}
                        alt="File Preview"
                        style={{ filter: spoiler && !hideSpoiler ? "blur(44px)" : "none" }}
                    />

                    <div className={styles.imageTags}>
                        {attachment.description && <span>Alt</span>}
                        {spoiler && hideSpoiler && <span>Spoiler</span>}
                    </div>
                </div>

                <div className={styles.fileName}>
                    <div>{attachment.name}</div>
                </div>
            </div>

            <div className={styles.fileMenu}>
                <div>
                    <Tooltip>
                        <TooltipTrigger>
                            <button
                                className={styles.fileMenuButton}
                                onClick={() => {
                                    setAttachments((prev) =>
                                        prev.map((a) =>
                                            a.id === attachment.id ? { ...a, spoiler: !spoiler } : a
                                        )
                                    );
                                }}
                            >
                                <Icon
                                    size={20}
                                    name={spoiler ? "eyeSlash" : "eye"}
                                />
                            </button>
                        </TooltipTrigger>

                        <TooltipContent>{spoiler ? "Hide Spoiler" : "Show Spoiler"}</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger>
                            <button
                                className={styles.fileMenuButton}
                                onClick={() => {
                                    // setLayers({
                                    //     settings: { type: "POPUP" },
                                    //     content: {
                                    //         type: "FILE_EDIT",
                                    //         file: attachment,
                                    //         handleFileChange,
                                    //     },
                                    // });
                                }}
                            >
                                <Icon
                                    size={20}
                                    name="edit"
                                />
                            </button>
                        </TooltipTrigger>

                        <TooltipContent>Modify Attachment</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger>
                            <button
                                className={styles.fileMenuButton + " " + styles.danger}
                                onClick={() => {
                                    setAttachments((prev) =>
                                        prev.filter((a) => a.id !== attachment.id)
                                    );
                                }}
                            >
                                <Icon
                                    size={20}
                                    name="delete"
                                    fill="var(--error-1)"
                                />
                            </button>
                        </TooltipTrigger>

                        <TooltipContent>Remove Attachment</TooltipContent>
                    </Tooltip>
                </div>
            </div>
        </li>
    );
}
