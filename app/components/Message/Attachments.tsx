"use client";

import type { Attachment, DMChannel, GuildChannel, ResponseMessage } from "@/type";
import type { PlaceholderValue } from "next/dist/shared/lib/get-img-props";
import { useAuthenticatedUser } from "@/hooks/useAuthenticatedUser";
import { readableExtensions, whichType } from "@/lib/files";
import type { MessageFunctions } from "./Message";
import { getImageDimensions } from "@/lib/images";
import { memo, useEffect, useState } from "react";
import styles from "./Attachments.module.css";
import { getCdnUrl } from "@/lib/uploadthing";
import hljs from "highlight.js";
import Image from "next/image";
import {
    MessageMenuContent,
    TooltipContent,
    TooltipTrigger,
    AudioControls,
    DialogContent,
    DialogTrigger,
    DialogProtip,
    FixedMessage,
    VoiceMessage,
    MenuTrigger,
    ImageViewer,
    Tooltip,
    Dialog,
    Icon,
    Menu,
} from "@components";

export const AttachmentList = memo(
    ({
        message,
        channel,
        functions,
        noInteraction,
    }: {
        message: ResponseMessage;
        channel: DMChannel | GuildChannel;
        functions: MessageFunctions;
        noInteraction?: boolean;
    }) => {
        const ImageComponent = ({ attachment }: { attachment: Attachment }) => (
            <DisplayableAttachment
                message={message}
                channel={channel}
                functions={functions}
                attachment={attachment}
                noInteraction={noInteraction}
            />
        );

        const attachments = message.attachments;
        const displayable = attachments.filter((a) => ["image", "video"].includes(a.type));
        const others = attachments.filter((a) => !["image", "video"].includes(a.type));
        const displayableLength = displayable.length;
        const othersLength = others.length;

        return (
            <>
                {othersLength > 0 && (
                    <div className={`${styles.attachments} ${styles.otherAttachments}`}>
                        {others.map((a) => (
                            <NonVisualAttachment
                                key={a.id}
                                attachment={a}
                                message={message}
                                functions={functions}
                                noInteraction={noInteraction}
                            />
                        ))}
                    </div>
                )}

                {displayableLength > 0 && (
                    <div className={styles.attachments}>
                        <div>
                            {displayableLength === 1 && (
                                <div
                                    className={`${styles.oneByOneGrid} ${styles.oneByOneGridSingle}`}
                                >
                                    <ImageComponent attachment={displayable[0]} />
                                </div>
                            )}

                            {displayableLength == 2 && (
                                <div className={styles.oneByTwoGrid}>
                                    {displayable.map((a) => (
                                        <div
                                            className={styles.oneByTwoGridItem}
                                            key={a.id}
                                        >
                                            <ImageComponent attachment={a} />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {displayableLength == 3 && (
                                <div
                                    className={`${styles.oneByTwoGrid} ${styles.oneByTwoLayoutThreeGrid}`}
                                >
                                    <div className={styles.oneByTwoSoloItem}>
                                        <ImageComponent attachment={displayable[0]} />
                                    </div>

                                    <div className={styles.oneByTwoDuoItem}>
                                        <div className={styles.twoByOneGrid}>
                                            {displayable.slice(1, 3).map((a) => (
                                                <div
                                                    className={styles.twoByOneGridItem}
                                                    key={a.id}
                                                >
                                                    <ImageComponent attachment={a} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {displayableLength == 4 && (
                                <div className={styles.twoByTwoGrid}>
                                    {displayable.map((a) => (
                                        <ImageComponent
                                            attachment={a}
                                            key={a.id}
                                        />
                                    ))}
                                </div>
                            )}

                            {displayableLength == 5 && (
                                <>
                                    <div className={styles.oneByTwoGrid}>
                                        {displayable.slice(0, 2).map((a) => (
                                            <div
                                                className={styles.oneByTwoGridItem}
                                                key={a.id}
                                            >
                                                <ImageComponent attachment={a} />
                                            </div>
                                        ))}
                                    </div>

                                    <div className={styles.threeByThreeGrid}>
                                        {displayable.slice(2, 5).map((a) => (
                                            <ImageComponent
                                                attachment={a}
                                                key={a.id}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}

                            {displayableLength == 6 && (
                                <div className={styles.threeByThreeGrid}>
                                    {displayable.map((a) => (
                                        <ImageComponent
                                            attachment={a}
                                            key={a.id}
                                        />
                                    ))}
                                </div>
                            )}

                            {displayableLength == 7 && (
                                <>
                                    <div className={styles.oneByOneGrid}>
                                        <ImageComponent attachment={displayable[0]} />
                                    </div>

                                    <div className={styles.threeByThreeGrid}>
                                        {displayable.slice(1, 7).map((a) => (
                                            <ImageComponent
                                                attachment={a}
                                                key={a.id}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}

                            {displayableLength == 8 && (
                                <>
                                    <div className={styles.oneByTwoGrid}>
                                        {displayable.slice(0, 2).map((a) => (
                                            <div
                                                className={styles.oneByTwoGridItem}
                                                key={a.id}
                                            >
                                                <ImageComponent attachment={a} />
                                            </div>
                                        ))}
                                    </div>

                                    <div className={styles.threeByThreeGrid}>
                                        {displayable.slice(2, 8).map((a) => (
                                            <ImageComponent
                                                attachment={a}
                                                key={a.id}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}

                            {displayableLength == 9 && (
                                <div className={styles.threeByThreeGrid}>
                                    {displayable.map((a) => (
                                        <ImageComponent
                                            attachment={a}
                                            key={a.id}
                                        />
                                    ))}
                                </div>
                            )}

                            {displayableLength == 10 && (
                                <>
                                    <div className={styles.oneByOneGrid}>
                                        <ImageComponent attachment={displayable[0]} />
                                    </div>

                                    <div className={styles.threeByThreeGrid}>
                                        {displayable.slice(1, 10).map((a) => (
                                            <ImageComponent
                                                attachment={a}
                                                key={a.id}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </>
        );
    },
    (prev, next) => {
        return (
            JSON.stringify(prev.message.attachments) === JSON.stringify(next.message.attachments) &&
            JSON.stringify(prev.message.embeds) === JSON.stringify(next.message.embeds) &&
            prev.message.content === next.message.content
        );
    }
);

export function DisplayableAttachment({
    message,
    channel,
    functions,
    attachment,
    noInteraction,
}: {
    message: ResponseMessage;
    channel: DMChannel | GuildChannel;
    functions: MessageFunctions;
    attachment: Attachment;
    noInteraction?: boolean;
}) {
    const [showImageViewer, setShowImageViewer] = useState(false);
    const [couldntLoad, setCouldntLoad] = useState(false);
    const [hideSpoiler, setHideSpoiler] = useState(false);
    const [loading, setLoading] = useState(false);
    const user = useAuthenticatedUser();

    const isSpoiler = attachment.spoiler && !hideSpoiler;
    const isAuthor = user.id == message.author.id;
    const isImage = attachment.type === "image";
    const isVideo = attachment.type === "video";
    const length = message.attachments.length;

    const deleteArgs = {
        attachment: {
            title: "Are you sure?",
            description: "This will remove this attachment from this message permanently.",
            confirm: "Remove Attachment",
        },
        message: {
            title: "Delete Message",
            description: "Are you sure you want to delete this message?",
            confirm: "Delete",
        },
    };

    const deleteInstead = length === 1 && !message.content && !message.embeds?.length;
    const arg = deleteInstead ? deleteArgs.message : deleteArgs.attachment;
    const index = message.attachments.findIndex((a) => a.id === attachment.id);
    const url = `${getCdnUrl}${attachment.id}`;

    const { width: maxWidth, height: maxHeight } = getMaxDimensions(length, index);

    function copyImage() {
        if (!isImage || noInteraction) return;

        try {
            fetch(url)
                .then((response) => response.blob())
                .then((blob) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(blob);
                    reader.onloadend = () => {
                        navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
                    };
                });
        } catch (error) {
            console.error(error);
        }
    }

    async function saveImage() {
        if (!isImage || noInteraction) return;

        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const newURL = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = newURL;
            a.download = attachment.filename;
            a.click();
            URL.revokeObjectURL(newURL);
        } catch (error) {
            console.error(error);
        }
    }

    function copyLink() {
        navigator.clipboard.writeText(url);
    }

    function openLink() {
        window.open(url);
    }

    const { width, height } = getImageDimensions(
        attachment.width,
        attachment.height,
        maxWidth,
        maxHeight,
        length !== 1
    );

    if (isVideo) {
        return (
            <div>
                <video
                    src={url}
                    width={width}
                    height={height}
                    className={styles.image}
                    controls={!noInteraction}
                    style={{
                        filter: isSpoiler ? "blur(44px)" : "",
                        cursor: !functions ? "default" : "",
                        maxHeight: `min(${maxHeight}px, 100%)`,
                        maxWidth: `min(${maxWidth}px, 100%)`,
                        height: `${height}px`,
                        width: `${width}px`,
                    }}
                />
            </div>
        );
    }

    return (
        <Menu
            positionOnClick
            openOnRightClick
            placement="bottom-start"
        >
            <MenuTrigger>
                <div
                    className={styles.attachment}
                    onClick={() => isSpoiler && setHideSpoiler(true)}
                    onContextMenu={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                    style={{
                        backgroundColor: couldntLoad ? "var(--background-3)" : "",
                        maxHeight: `min(${maxHeight}px, 100%)`,
                        maxWidth: `min(${maxWidth}px, 100%)`,
                        cursor: couldntLoad ? "default" : "",
                        height: `${height}px`,
                        width: `${width}px`,
                    }}
                >
                    {couldntLoad ? (
                        <Image
                            width={120}
                            height={120}
                            draggable={false}
                            className={styles.image}
                            src={`/assets/system/poop.svg`}
                            alt={attachment.filename || "Attachment"}
                            placeholder={getPlaceholder(width, height)}
                            style={{
                                height: "120px",
                                minWidth: "unset",
                                minHeight: "unset",
                            }}
                        />
                    ) : (
                        <Image
                            src={url}
                            tabIndex={0}
                            width={width}
                            height={height}
                            draggable={false}
                            className={styles.image}
                            alt={attachment.filename || "Attachment"}
                            placeholder={getPlaceholder(width, height)}
                            style={{
                                filter: isSpoiler ? "blur(44px)" : "",
                                cursor: !functions ? "default" : "",
                                maxHeight: `min(${maxHeight}px, 100%)`,
                                maxWidth: `min(${maxWidth}px, 100%)`,
                                height: `${height}px`,
                                width: `${width}px`,
                            }}
                            onError={({ currentTarget }) => {
                                setCouldntLoad(true);
                                currentTarget.onerror = null;
                                currentTarget.src = "/assets/system/poop.svg";
                            }}
                            onClick={() => {
                                if (!isSpoiler) {
                                    setShowImageViewer(true);
                                }
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !isSpoiler) {
                                    setShowImageViewer(true);
                                }
                            }}
                        />
                    )}

                    <Dialog
                        open={showImageViewer}
                        onOpenChange={(v) => setShowImageViewer(v)}
                    >
                        {!!functions && (
                            <DialogContent blank>
                                <ImageViewer
                                    currentIndex={index}
                                    attachments={message.attachments}
                                />
                            </DialogContent>
                        )}
                    </Dialog>

                    {!isSpoiler && isAuthor && functions && !noInteraction && (
                        <Dialog>
                            <Tooltip>
                                <DialogTrigger>
                                    <TooltipTrigger>
                                        <button className={styles.deleteImage}>
                                            <Icon name="delete" />
                                        </button>
                                    </TooltipTrigger>
                                </DialogTrigger>

                                <TooltipContent>Delete</TooltipContent>
                            </Tooltip>

                            <DialogContent
                                confirmColor="red"
                                heading={arg.title}
                                confirmLoading={loading}
                                confirmLabel={arg.confirm}
                                description={arg.description}
                                onConfirm={async () => {
                                    setLoading(true);

                                    if (deleteInstead) {
                                        await functions.deleteMessage();
                                    } else if (typeof attachment.id === "string") {
                                        await functions.deleteAttachment(attachment.id);
                                    }

                                    setLoading(false);
                                }}
                            >
                                {deleteInstead && (
                                    <>
                                        <FixedMessage message={message} />

                                        <DialogProtip>
                                            You can hold down shift when clicking{" "}
                                            <strong>delete message</strong> to bypass this
                                            confirmation entirely.
                                        </DialogProtip>
                                    </>
                                )}
                            </DialogContent>
                        </Dialog>
                    )}

                    {isSpoiler && <button className={styles.spoilerButton}>Spoiler</button>}

                    {attachment.description && !isSpoiler && (
                        <Tooltip>
                            <TooltipTrigger>
                                <button className={styles.imageAlt}>ALT</button>
                            </TooltipTrigger>

                            <TooltipContent>{attachment.description}</TooltipContent>
                        </Tooltip>
                    )}
                </div>
            </MenuTrigger>

            {!noInteraction && (
                <MessageMenuContent
                    message={message}
                    channel={channel}
                    functions={functions}
                    attachment={attachment}
                    attachmentFunctions={{
                        copyImage,
                        saveImage,
                        copyLink,
                        openLink,
                    }}
                />
            )}
        </Menu>
    );
}

export function NonVisualAttachment({
    message,
    functions,
    attachment,
    noInteraction,
}: {
    message: ResponseMessage;
    functions: MessageFunctions;
    attachment: Attachment;
    noInteraction?: boolean;
}) {
    const [textExpanded, setTextExpanded] = useState(false);
    const [fullTextOpen, setFullTextOpen] = useState(false);

    const [expandedText, setExpandedText] = useState("");
    const [previewText, setPreviewText] = useState("");
    const [fullText, setFullText] = useState("");

    const [loading, setLoading] = useState(false);

    const user = useAuthenticatedUser();
    const isAuthor = user.id === message.author.id;

    const length = message.attachments.length;
    const deleteInstead = length === 1 && !message.content && !message.embeds?.length;

    const deleteArgs = {
        attachment: {
            title: "Are you sure?",
            description: "This will remove this attachment from this message permanently.",
            confirm: "Remove Attachment",
        },
        message: {
            title: "Delete Message",
            description: "Are you sure you want to delete this message?",
            confirm: "Delete",
        },
    };

    const arg = deleteInstead ? deleteArgs.message : deleteArgs.attachment;

    useEffect(() => {
        const fetchFileContent = async () => {
            const isReadable = readableExtensions.includes(attachment.ext);

            if (attachment.type !== "audio" && isReadable) {
                // Define the URL to fetch the file content (replace `yourApiUrl` with your actual API URL)
                const fileUrl = `${getCdnUrl}${attachment.id}`;

                try {
                    const response = await fetch(fileUrl);
                    if (!response.ok) {
                        console.error("Error fetching file content:", response.statusText);
                        return;
                    }

                    const reader = response.body?.getReader();
                    if (!reader) {
                        console.error("Unable to read the response body.");
                        return;
                    }

                    let receivedBytes = 0;
                    const maxBytes = 50000; // 50 KB
                    const chunks: Uint8Array[] = [];

                    while (receivedBytes < maxBytes) {
                        const { done, value } = await reader.read();
                        if (done) break;

                        const chunk = value.slice(
                            0,
                            Math.min(value.length, maxBytes - receivedBytes)
                        );
                        chunks.push(chunk);
                        receivedBytes += chunk.length;
                    }

                    // Combine the chunks into a single Uint8Array
                    const fullUint8Array = new Uint8Array(receivedBytes);
                    let offset = 0;
                    for (const chunk of chunks) {
                        fullUint8Array.set(chunk, offset);
                        offset += chunk.length;
                    }

                    // Decode the first 50 KB into a string
                    const text = new TextDecoder().decode(fullUint8Array);

                    // Process the text
                    const lines = text.split("\n");
                    const preview = lines.slice(0, 6).join("\n");
                    const expanded = lines.slice(0, 100).join("\n");

                    const hasMoreLines = lines.length > 100;
                    const isMore = attachment.size > maxBytes;
                    const remaining = attachment.size - maxBytes;
                    const left = `... (${
                        isMore ? getSize(remaining) : lines.length - 100 + " lines"
                    } left)`;

                    setPreviewText(isMore ? `${preview}${left}` : preview);
                    setExpandedText(hasMoreLines ? `${expanded}${left}` : expanded);
                    setFullText(isMore ? `${text}${left}` : text);
                } catch (error) {
                    console.error("Error fetching file content:", error);
                }
            }
        };

        fetchFileContent();
    }, [attachment]);

    useEffect(() => {
        const code = document.getElementById(`code-${attachment.id}`);
        if (!code) return;
        code.removeAttribute("data-highlighted");
        hljs.highlightElement(code);
    }, [textExpanded]);

    async function handleDownload() {
        if (!functions || noInteraction) return;

        try {
            const response = await fetch(`${getCdnUrl}${attachment.id}`);
            if (!response.ok) {
                console.error("Failed to fetch the file:", response.statusText);
                return;
            }

            const blob = await response.blob();

            const url = URL.createObjectURL(blob);

            const anchor = document.createElement("a");
            anchor.href = url;
            anchor.download = attachment.filename ?? `unknown.${attachment.ext}`;
            document.body.appendChild(anchor);

            anchor.click();

            document.body.removeChild(anchor);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error during file download:", error);
        }
    }

    return (
        <div
            className={`${styles.nonVisualAttachment} ${previewText ? styles.text : ""} ${
                attachment.voiceMessage ? styles.voiceMessage : ""
            }`}
        >
            {(!previewText || isAuthor) && !attachment.voiceMessage && (
                <div className={styles.actions}>
                    {!previewText && !noInteraction && (
                        <Tooltip>
                            <TooltipTrigger>
                                <button onClick={handleDownload}>
                                    <Icon
                                        name="download"
                                        size={20}
                                    />
                                </button>
                            </TooltipTrigger>

                            <TooltipContent>Download</TooltipContent>
                        </Tooltip>
                    )}

                    {isAuthor && !noInteraction && (
                        <Dialog>
                            <Tooltip>
                                <DialogTrigger>
                                    <TooltipTrigger>
                                        <button className={styles.delete}>
                                            <Icon
                                                name="delete"
                                                size={20}
                                            />
                                        </button>
                                    </TooltipTrigger>
                                </DialogTrigger>

                                <TooltipContent>Delete</TooltipContent>
                            </Tooltip>

                            <DialogContent
                                confirmColor="red"
                                heading={arg.title}
                                confirmLabel={arg.confirm}
                                description={arg.description}
                                onConfirm={async () => {
                                    setLoading(true);

                                    if (deleteInstead) {
                                        await functions.deleteMessage();
                                    } else if (typeof attachment.id === "string") {
                                        await functions.deleteAttachment(attachment.id);
                                    }

                                    setLoading(false);
                                }}
                                confirmLoading={loading}
                            >
                                {deleteInstead && (
                                    <>
                                        <FixedMessage message={message} />

                                        <DialogProtip>
                                            You can hold down shift when clicking{" "}
                                            <strong>delete message</strong> to bypass this
                                            confirmation entirely.
                                        </DialogProtip>
                                    </>
                                )}
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            )}

            {attachment.type === "audio" ? (
                attachment.voiceMessage ? (
                    <div style={{ marginTop: "8px" }}>
                        <VoiceMessage url={`${getCdnUrl}${attachment.id}`} />
                    </div>
                ) : (
                    <div className={styles.audio}>
                        <header>
                            <Icon name="file-audio" />
                            <div>
                                <a
                                    target="_blank"
                                    href={`${getCdnUrl}${attachment.id}`}
                                >
                                    {attachment.filename}
                                </a>
                                <p>{getSize(attachment.size)}</p>
                            </div>
                        </header>

                        <AudioControls url={`${getCdnUrl}${attachment.id}`} />
                    </div>
                )
            ) : previewText ? (
                <div className={styles.text}>
                    <div className={styles.content}>
                        <pre>
                            <code
                                id={`code-${attachment.id}`}
                                ref={(el) => {
                                    if (el) hljs.highlightElement(el);
                                }}
                                className={`language-${attachment.ext} ${styles.code}`}
                            >
                                {textExpanded ? expandedText : previewText}
                            </code>
                        </pre>
                    </div>

                    <div className={styles.tools}>
                        <Tooltip>
                            <TooltipTrigger>
                                <button
                                    onClick={() => {
                                        if (noInteraction) return;
                                        setTextExpanded((prev) => !prev);
                                    }}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        height="24"
                                        width="24"
                                        style={{
                                            transform: textExpanded ? "rotate(180deg)" : "",
                                        }}
                                    >
                                        <path
                                            fill="currentColor"
                                            d="M5.3 9.3a1 1 0 0 1 1.4 0l5.3 5.29 5.3-5.3a1 1 0 1 1 1.4 1.42l-6 6a1 1 0 0 1-1.4 0l-6-6a1 1 0 0 1 0-1.42Z"
                                        />
                                    </svg>
                                    {textExpanded ? "Collapse" : "Expand"}
                                </button>
                            </TooltipTrigger>

                            {!noInteraction && (
                                <TooltipContent>
                                    {textExpanded
                                        ? `Collapse (${expandedText.split("\n").length} lines)`
                                        : `Expand (${expandedText.split("\n").length} lines)`}
                                </TooltipContent>
                            )}
                        </Tooltip>

                        <Dialog
                            open={fullTextOpen && !noInteraction}
                            onOpenChange={(v) => setFullTextOpen(v)}
                        >
                            <Tooltip>
                                <TooltipTrigger>
                                    <button onClick={() => setFullTextOpen(true)}>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            height="16"
                                            width="16"
                                        >
                                            <path
                                                fill="currentColor"
                                                d="M14 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0V5.41l-5.3 5.3a1 1 0 0 1-1.4-1.42L18.58 4H15a1 1 0 0 1-1-1ZM5.41 20H9a1 1 0 1 1 0 2H3a1 1 0 0 1-1-1v-6a1 1 0 1 1 2 0v3.59l5.3-5.3a1 1 0 0 1 1.4 1.42L5.42 20Z"
                                            />
                                        </svg>
                                    </button>
                                </TooltipTrigger>

                                {!noInteraction && <TooltipContent>View whole file</TooltipContent>}

                                {!noInteraction && (
                                    <DialogContent blank>
                                        <div className={styles.textModal}>
                                            <div className="scrollbar">
                                                <pre>
                                                    <code
                                                        ref={(el) => {
                                                            if (el) hljs.highlightElement(el);
                                                        }}
                                                        className={`language-${attachment.ext} hljs`}
                                                    >
                                                        {fullText}
                                                    </code>
                                                </pre>
                                            </div>

                                            <div className={styles.tools}>
                                                <div />
                                                <div />
                                                <div />

                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        <span>{attachment.filename}</span>
                                                    </TooltipTrigger>

                                                    <TooltipContent>
                                                        {attachment.filename} (
                                                        {getSize(attachment.size)})
                                                    </TooltipContent>
                                                </Tooltip>

                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        <span>{getSize(attachment.size)}</span>
                                                    </TooltipTrigger>

                                                    <TooltipContent>
                                                        {attachment.filename} (
                                                        {getSize(attachment.size)})
                                                    </TooltipContent>
                                                </Tooltip>

                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        <a onClick={handleDownload}>
                                                            <Icon name="download" />
                                                        </a>
                                                    </TooltipTrigger>

                                                    <TooltipContent>
                                                        Download {attachment.filename} (
                                                        {getSize(attachment.size)})
                                                    </TooltipContent>
                                                </Tooltip>

                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        <button
                                                            aria-label="Change language"
                                                            aria-expanded="false"
                                                        >
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                height="24"
                                                                width="24"
                                                            >
                                                                <path
                                                                    fill="currentColor"
                                                                    d="M9.6 7.8 4 12l5.6 4.2a1 1 0 0 1 .4.8v1.98c0 .21-.24.33-.4.2l-8.1-6.4a1 1 0 0 1 0-1.56l8.1-6.4c.16-.13.4-.01.4.2V7a1 1 0 0 1-.4.8ZM14.4 7.8 20 12l-5.6 4.2a1 1 0 0 0-.4.8v1.98c0 .21.24.33.4.2l8.1-6.4a1 1 0 0 0 0-1.56l-8.1-6.4a.25.25 0 0 0-.4.2V7a1 1 0 0 0 .4.8Z"
                                                                />
                                                            </svg>
                                                        </button>
                                                    </TooltipTrigger>

                                                    <TooltipContent>Change language</TooltipContent>
                                                </Tooltip>
                                            </div>
                                        </div>
                                    </DialogContent>
                                )}
                            </Tooltip>
                        </Dialog>

                        <div />

                        <Tooltip>
                            <TooltipTrigger>
                                <span>{attachment.filename}</span>
                            </TooltipTrigger>

                            <TooltipContent>
                                {attachment.filename} ({getSize(attachment.size)})
                            </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger>
                                <span>{getSize(attachment.size)}</span>
                            </TooltipTrigger>

                            <TooltipContent>
                                {attachment.filename} ({getSize(attachment.size)})
                            </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger>
                                <a onClick={handleDownload}>
                                    <Icon name="download" />
                                </a>
                            </TooltipTrigger>

                            {!noInteraction && (
                                <TooltipContent>
                                    Download {attachment.filename} ({getSize(attachment.size)})
                                </TooltipContent>
                            )}
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger>
                                <button
                                    aria-label="Change language"
                                    aria-expanded="false"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        height="24"
                                        width="24"
                                    >
                                        <path
                                            fill="currentColor"
                                            d="M9.6 7.8 4 12l5.6 4.2a1 1 0 0 1 .4.8v1.98c0 .21-.24.33-.4.2l-8.1-6.4a1 1 0 0 1 0-1.56l8.1-6.4c.16-.13.4-.01.4.2V7a1 1 0 0 1-.4.8ZM14.4 7.8 20 12l-5.6 4.2a1 1 0 0 0-.4.8v1.98c0 .21.24.33.4.2l8.1-6.4a1 1 0 0 0 0-1.56l-8.1-6.4a.25.25 0 0 0-.4.2V7a1 1 0 0 0 .4.8Z"
                                        />
                                    </svg>
                                </button>
                            </TooltipTrigger>

                            {!noInteraction && <TooltipContent>Change language</TooltipContent>}
                        </Tooltip>
                    </div>
                </div>
            ) : (
                <div>
                    <header>
                        <Icon name={`file-${whichType(attachment.ext)}`} />

                        <div>
                            <a
                                target="_blank"
                                href={`${getCdnUrl}${attachment.id}`}
                            >
                                {attachment.filename}
                            </a>

                            <p>{getSize(attachment.size)}</p>
                        </div>
                    </header>
                </div>
            )}
        </div>
    );
}

const shimmer = (w: number, h: number) => `
        <svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
            <defs>
                <linearGradient id="g">
                    <stop stop-color="#333" offset="20%" />
                    <stop stop-color="#222" offset="50%" />
                    <stop stop-color="#333" offset="70%" />
                </linearGradient>
            </defs>

            <rect width="${w}" height="${h}" fill="#333" />
            <rect id="r" width="${w}" height="${h}" fill="url(#g)" />

            <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1.5s" repeatCount="indefinite"  />
        </svg>
    `;

export const getPlaceholder = (w: number, h: number) => {
    const str = shimmer(w, h);
    const base64 =
        typeof window === "undefined" ? Buffer.from(str).toString("base64") : window.btoa(str);
    return `data:image/svg+xml;base64,${base64}` as PlaceholderValue;
};

export function getMaxDimensions(
    length: number,
    index: number
): {
    width: number;
    height: number;
} {
    switch (length) {
        case 1:
            return { width: 550, height: 350 };

        case 2:
            return { width: 273, height: 273 };

        case 3:
            return index === 0 ? { width: 364, height: 350 } : { width: 182, height: 173 };

        case 4:
            return { width: 273, height: 173 };

        case 5:
            return index < 2 ? { width: 273, height: 273 } : { width: 181, height: 181 };

        case 6:
            return { width: 181, height: 181 };

        case 7:
            return index === 0 ? { width: 550, height: 280 } : { width: 181, height: 181 };

        case 8:
            return index < 2 ? { width: 273, height: 273 } : { width: 181, height: 181 };

        case 9:
            return { width: 181, height: 181 };

        case 10:
            return index === 0 ? { width: 550, height: 280 } : { width: 181, height: 181 };

        default:
            throw new Error("Invalid length. Supported lengths are 1 to 10.");
    }
}

export function getSize(size: number) {
    // no decimal, always round up

    if (size < 1024) {
        return `${size} B`;
    } else if (size < 1024 * 1024) {
        return `${Math.ceil(size / 1024)} KB`;
    } else if (size < 1024 * 1024 * 1024) {
        return `${Math.ceil(size / 1024 / 1024)} MB`;
    } else {
        return `${Math.ceil(size / 1024 / 1024 / 1024)} GB`;
    }
}
