"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import styles from "./TextArea.module.css";
import type { Attachment } from "@/type";
import { whichType } from "@/lib/files";
import {
    TooltipContent,
    TooltipTrigger,
    DialogContent,
    DialogTrigger,
    ImageViewer,
    Tooltip,
    Dialog,
    Input,
    Icon,
} from "@components";

export function FilePreview({
    attachment,
    setAttachments,
}: {
    attachment: Attachment;
    setAttachments: Dispatch<SetStateAction<Attachment[]>>;
}) {
    const [description, setDescription] = useState(attachment.description);
    const [showImagePreview, setShowImagePreview] = useState(false);
    const [filename, setFilename] = useState(attachment.filename);
    const [spoiler, setSpoiler] = useState(attachment.spoiler);
    const [hideSpoiler, setHideSpoiler] = useState(attachment.type !== "image");

    const isSpoiler = attachment.spoiler;
    const isImage = attachment.type === "image";

    function handleFileChange({ filename, spoiler, description }: Partial<Attachment>) {
        setAttachments((prev) =>
            prev.map((a) => {
                if (a.id === attachment.id) {
                    return {
                        ...a,
                        filename: filename ?? a.filename,
                        spoiler: spoiler ?? a.spoiler,
                        description: description ?? a.description,
                    };
                }
                return a;
            })
        );
    }

    const type = whichType(attachment.ext);
    let imageIcon = `file-${type}`;

    return (
        <li className={styles.fileItem}>
            <div className={styles.fileItemContainer}>
                <div
                    className={styles.image}
                    style={{
                        backgroundColor:
                            isSpoiler && !hideSpoiler ? "var(--background-dark-3)" : "",
                        cursor: isSpoiler && !hideSpoiler ? "pointer" : "default",
                    }}
                    onClick={() => isSpoiler && setHideSpoiler(true)}
                >
                    {isSpoiler && !hideSpoiler && (
                        <div className={styles.spoilerButton}>Spoiler</div>
                    )}

                    {isImage ? (
                        <img
                            draggable="false"
                            alt="File Preview"
                            src={attachment.url}
                            style={{
                                filter: isSpoiler && !hideSpoiler ? "blur(44px)" : "none",
                                cursor: "pointer",
                            }}
                            onClick={() => {
                                if (!isSpoiler || hideSpoiler) {
                                    setShowImagePreview(true);
                                }
                            }}
                        />
                    ) : (
                        <Icon name={imageIcon} />
                    )}

                    <Dialog
                        open={showImagePreview}
                        onOpenChange={setShowImagePreview}
                    >
                        <DialogContent blank>
                            <ImageViewer
                                attachments={[attachment]}
                                currentIndex={0}
                            />
                        </DialogContent>
                    </Dialog>

                    <div className={styles.imageTags}>
                        {attachment.description && <span>Alt</span>}
                        {isSpoiler && hideSpoiler && <span>Spoiler</span>}
                    </div>
                </div>

                <div className={styles.fileName}>
                    <div>{attachment.filename}</div>
                </div>
            </div>

            <div className={styles.fileMenu}>
                <div>
                    <Tooltip>
                        <TooltipTrigger>
                            <button
                                type="button"
                                className={styles.fileMenuButton}
                                onClick={() => {
                                    setAttachments((prev) =>
                                        prev.map((a) =>
                                            a.id === attachment.id
                                                ? { ...a, spoiler: !isSpoiler }
                                                : a
                                        )
                                    );

                                    setSpoiler((prev) => !prev);
                                }}
                            >
                                <Icon
                                    size={20}
                                    name={isSpoiler ? "eyeSlash" : "eye"}
                                />
                            </button>
                        </TooltipTrigger>

                        <TooltipContent>
                            {isSpoiler ? "Hide Spoiler" : "Show Spoiler"}
                        </TooltipContent>
                    </Tooltip>

                    <Dialog>
                        <Tooltip>
                            <DialogTrigger>
                                <TooltipTrigger>
                                    <button
                                        type="button"
                                        className={styles.fileMenuButton}
                                    >
                                        <Icon
                                            size={20}
                                            name="edit"
                                        />
                                    </button>
                                </TooltipTrigger>
                            </DialogTrigger>

                            <TooltipContent>Modify Attachment</TooltipContent>

                            <DialogContent
                                closeOnConfirm
                                confirmLabel="Save"
                                artFullUrl={isImage}
                                heading={attachment.filename || "No filename"}
                                art={isImage ? attachment.url : `${imageIcon}.svg`}
                                onConfirm={() =>
                                    handleFileChange({
                                        filename,
                                        spoiler,
                                        description,
                                    })
                                }
                                onCancel={() => {
                                    setFilename(attachment.filename);
                                    setDescription(attachment.description);
                                    setSpoiler(attachment.spoiler);
                                }}
                            >
                                <Input
                                    name="filename"
                                    label="Filename"
                                    value={filename}
                                    onChange={(value) => setFilename(value)}
                                />

                                {isImage && (
                                    <Input
                                        name="description"
                                        value={description}
                                        label="Description (Alt Text)"
                                        placeholder="Add a description"
                                        onChange={(value) => setDescription(value)}
                                    />
                                )}

                                <Input
                                    type="checkbox"
                                    name="spoiler"
                                    label="Mark as spoiler"
                                    checked={spoiler}
                                    onChange={() => setSpoiler((prev) => !prev)}
                                />
                            </DialogContent>
                        </Tooltip>
                    </Dialog>

                    <Tooltip>
                        <TooltipTrigger>
                            <button
                                type="button"
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
