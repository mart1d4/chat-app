"use client";

import type { PlaceholderValue } from "next/dist/shared/lib/get-img-props";
import type { AppMessage, Attachment, EitherAttachment } from "@/type";
import { useAuthenticatedUser } from "@/hooks/useAuthenticatedUser";
import type { MessageFunctions } from "./Message";
import { getImageDimensions } from "@/lib/images";
import styles from "./Attachments.module.css";
import { getCdnUrl } from "@/lib/urls";
import { memo, useEffect, useState } from "react";
import Image from "next/image";
import {
    TooltipContent,
    TooltipTrigger,
    DialogContent,
    DialogTrigger,
    DialogProtip,
    FixedMessage,
    ImageViewer,
    Tooltip,
    Dialog,
    Icon,
} from "@components";
import { readableExtensions, whichType } from "@/lib/files";
import hljs from "highlight.js";

export const AttachmentList = memo(
    ({ message, functions }: { message: AppMessage; functions?: MessageFunctions }) => {
        const ImageComponent = ({ attachment }: { attachment: EitherAttachment }) => (
            <Attachment
                message={message}
                functions={functions}
                attachment={attachment}
            />
        );

        const attachments = message.attachments;
        const displayableAttachments = attachments.filter((a) =>
            ["image", "video"].includes(a.type)
        );
        const otherAttachments = attachments.filter((a) => !["image", "video"].includes(a.type));

        const displayableLength = displayableAttachments.length;
        const othersLength = otherAttachments.length;

        return (
            <>
                {othersLength > 0 && (
                    <div className={`${styles.attachments} ${styles.otherAttachments}`}>
                        {otherAttachments.map((a) => (
                            <NonVisualAttachment
                                key={a.id}
                                attachment={a}
                                message={message}
                                functions={functions}
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
                                    <ImageComponent attachment={displayableAttachments[0]} />
                                </div>
                            )}

                            {displayableLength == 2 && (
                                <div className={styles.oneByTwoGrid}>
                                    {displayableAttachments.map((a) => (
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
                                        <ImageComponent attachment={displayableAttachments[0]} />
                                    </div>

                                    <div className={styles.oneByTwoDuoItem}>
                                        <div className={styles.twoByOneGrid}>
                                            {displayableAttachments.slice(1, 3).map((a) => (
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
                                    {displayableAttachments.map((a) => (
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
                                        {displayableAttachments.slice(0, 2).map((a) => (
                                            <div
                                                className={styles.oneByTwoGridItem}
                                                key={a.id}
                                            >
                                                <ImageComponent attachment={a} />
                                            </div>
                                        ))}
                                    </div>

                                    <div className={styles.threeByThreeGrid}>
                                        {displayableAttachments.slice(2, 5).map((a) => (
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
                                    {displayableAttachments.map((a) => (
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
                                        <ImageComponent attachment={displayableAttachments[0]} />
                                    </div>

                                    <div className={styles.threeByThreeGrid}>
                                        {displayableAttachments.slice(1, 7).map((a) => (
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
                                        {displayableAttachments.slice(0, 2).map((a) => (
                                            <div
                                                className={styles.oneByTwoGridItem}
                                                key={a.id}
                                            >
                                                <ImageComponent attachment={a} />
                                            </div>
                                        ))}
                                    </div>

                                    <div className={styles.threeByThreeGrid}>
                                        {displayableAttachments.slice(2, 8).map((a) => (
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
                                    {displayableAttachments.map((a) => (
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
                                        <ImageComponent attachment={displayableAttachments[0]} />
                                    </div>

                                    <div className={styles.threeByThreeGrid}>
                                        {displayableAttachments.slice(1, 10).map((a) => (
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

export function Attachment({
    attachment,
    message,
    functions,
}: {
    attachment: EitherAttachment;
    message: AppMessage;
    functions?: MessageFunctions;
}) {
    const [showImageViewer, setShowImageViewer] = useState(false);
    const [hideSpoiler, setHideSpoiler] = useState(false);
    const [loading, setLoading] = useState(false);
    const user = useAuthenticatedUser();

    const isSpoiler = attachment.spoiler && !hideSpoiler;
    const isAuthor = user.id == message.author.id;
    const isImage = attachment.type === "image";
    const isVideo = attachment.type === "video";

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

    const deleteInstead =
        message.attachments.length === 1 && !message.content && !message.embeds?.length;
    const arg = deleteInstead ? deleteArgs.message : deleteArgs.attachment;
    const index = message.attachments.findIndex((a) => a.id === attachment.id);

    const { width: maxWidth, height: maxHeight } = getMaxDimensions(
        message.attachments.length,
        index
    );

    const { width, height } = getImageDimensions(
        attachment.width,
        attachment.height,
        maxWidth,
        maxHeight,
        message.attachments.length !== 1
    );

    if (isVideo) {
        return (
            <div>
                <video
                    width={width}
                    height={height}
                    controls
                    className={styles.image}
                    src={`${getCdnUrl()}/${attachment.id}`}
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
        <div
            className={styles.attachment}
            onClick={() => isSpoiler && setHideSpoiler(true)}
            onContextMenu={() => {
                // setLayers({
                //     settings: {
                //         type: "MENU",
                //         event: e,
                //     },
                //     content: {
                //         type: "MESSAGE",
                //         message: message,
                //         attachment: attachment,
                //         functions: functions,
                //     },
                // });
            }}
            style={{
                maxHeight: `min(${maxHeight}px, 100%)`,
                maxWidth: `min(${maxWidth}px, 100%)`,
                height: `${height}px`,
                width: `${width}px`,
            }}
        >
            <Image
                tabIndex={0}
                width={width}
                height={height}
                draggable={false}
                className={styles.image}
                src={`${getCdnUrl()}/${attachment.id}`}
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
                    currentTarget.onerror = null;
                    currentTarget.src = `/assets/system/poop.svg`;
                }}
                onClick={() => {
                    if (!isSpoiler) {
                        setShowImageViewer(true);
                    }
                }}
                onKeyDown={(e) => {
                    e.stopPropagation();
                    if (e.key === "Enter" && !isSpoiler) {
                        setShowImageViewer(true);
                    }
                }}
            />

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

            {!isSpoiler && isAuthor && functions && (
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
                                    <strong>delete message</strong> to bypass this confirmation
                                    entirely.
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
    );
}

export function NonVisualAttachment({
    functions,
    attachment,
    message,
}: {
    functions: MessageFunctions;
    attachment: Attachment;
    message: AppMessage;
}) {
    const [audioVolumeBeforeMute, setAudioVolumeBeforeMute] = useState(1);
    const [isVolumeClicked, setIsVolumeClicked] = useState(false);
    const [audioCurrentTime, setAudioCurrentTime] = useState(0);
    const [textExpanded, setTextExpanded] = useState(false);
    const [fullTextOpen, setFullTextOpen] = useState(false);
    const [audioDuration, setAudioDuration] = useState(0);
    const [audioVolume, setAudioVolume] = useState(0.51);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isClicked, setIsClicked] = useState(false);

    const [textDataRemaining, setTextDataRemaining] = useState(0);
    const [expandedText, setExpandedText] = useState("");
    const [previewText, setPreviewText] = useState("");
    const [fullText, setFullText] = useState("");

    const [loading, setLoading] = useState(false);

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
                const fileUrl = `${getCdnUrl()}/${attachment.id}`;

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

                    if (isMore) {
                        setTextDataRemaining(remaining);
                    }
                } catch (error) {
                    console.error("Error fetching file content:", error);
                }
            }
        };

        fetchFileContent();
    }, [attachment]);

    useEffect(() => {
        const audio = document.getElementById(`audio-${attachment.id}`) as HTMLAudioElement | null;
        if (!audio) return;
        audio.volume = audioVolume;
    }, [audioVolume]);

    useEffect(() => {
        const code = document.getElementById(`code-${attachment.id}`);
        if (!code) return;
        code.removeAttribute("data-highlighted");
        hljs.highlightElement(code);
    }, [textExpanded]);

    async function handleDownload() {
        try {
            const response = await fetch(`${getCdnUrl()}/${attachment.id}`);
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
        <div className={`${styles.nonVisualAttachment} ${previewText ? styles.text : ""}`}>
            <div className={styles.actions}>
                {!previewText && (
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
                                    <strong>delete message</strong> to bypass this confirmation
                                    entirely.
                                </DialogProtip>
                            </>
                        )}
                    </DialogContent>
                </Dialog>
            </div>

            {attachment.type === "audio" ? (
                <div className={styles.audio}>
                    <header>
                        <Icon name="file-audio" />
                        <div>
                            <a
                                target="_blank"
                                href={`${getCdnUrl()}/${attachment.id}`}
                            >
                                {attachment.filename}
                            </a>
                            <p>{getSize(attachment.size)}</p>
                        </div>
                    </header>

                    <div className={styles.audioPlayer}>
                        <audio
                            preload="metadata"
                            id={`audio-${attachment.id}`}
                            onTimeUpdate={(e) => {
                                const audio = e.target as HTMLAudioElement;
                                setAudioCurrentTime(audio.currentTime);
                                setAudioDuration(audio.duration);

                                if (audio.buffered.length > 0) {
                                    const val = audio.buffered.end(0);

                                    const buffer = document.getElementById(
                                        `buffer-${attachment.id}`
                                    );

                                    if (buffer) {
                                        buffer.style.width = `${(val / audio.duration) * 100}%`;
                                    }
                                }
                            }}
                            onLoadedMetadata={(e) => {
                                const audio = e.target as HTMLAudioElement;
                                setAudioDuration(audio.duration);
                            }}
                            onProgress={(e) => {
                                const audio = e.target as HTMLAudioElement;
                                if (audio.buffered.length > 0) {
                                    const val = audio.buffered.end(0);

                                    const buffer = document.getElementById(
                                        `buffer-${attachment.id}`
                                    );

                                    if (buffer) {
                                        buffer.style.width = `${(val / audio.duration) * 100}%`;
                                    }
                                }
                            }}
                            onEnded={() => {
                                setIsPlaying(false);
                            }}
                        >
                            <source src={`${getCdnUrl()}/${attachment.id}`} />
                            Your browser does not support the audio element.
                        </audio>

                        <div className={styles.controls}>
                            <button
                                className={styles.play}
                                aria-label={isPlaying ? "Pause" : "Play"}
                                onClick={() => {
                                    if (!audioDuration) return;

                                    const audio = document.getElementById(
                                        `audio-${attachment.id}`
                                    ) as HTMLAudioElement;

                                    if (isPlaying) {
                                        audio.pause();
                                        setIsPlaying(false);
                                    } else {
                                        audio.play();
                                        setIsPlaying(true);
                                    }
                                }}
                            >
                                {isPlaying ? (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        height="24"
                                        width="24"
                                    >
                                        <path
                                            fill="currentColor"
                                            d="M6 4a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H6ZM15 4a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-3Z"
                                        />
                                    </svg>
                                ) : (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        height="24"
                                        width="24"
                                    >
                                        <path
                                            fill="currentColor"
                                            d="M9.25 3.35C7.87 2.45 6 3.38 6 4.96v14.08c0 1.58 1.87 2.5 3.25 1.61l10.85-7.04a1.9 1.9 0 0 0 0-3.22L9.25 3.35Z"
                                        />
                                    </svg>
                                )}
                            </button>

                            <div className={styles.duration}>
                                <span>
                                    {new Date(audioCurrentTime * 1000)
                                        .toISOString()
                                        .substr(14, 5) || "--:--"}
                                </span>
                                <span>/</span>
                                <span>
                                    {new Date(audioDuration * 1000).toISOString().substr(14, 5) ||
                                        "--:--"}
                                </span>
                            </div>

                            <div className={styles.progressContainer}>
                                <div
                                    onMouseMove={(e) => {
                                        const audio = document.getElementById(
                                            `audio-${attachment.id}`
                                        ) as HTMLAudioElement;
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        const x = e.clientX - rect.left;
                                        const width = rect.width;
                                        const time = (x / width) * audio.duration;

                                        // if clicked, set the current time
                                        if (isClicked) {
                                            audio.currentTime =
                                                time > audio.duration
                                                    ? audio.duration
                                                    : time < 0
                                                    ? 0
                                                    : time;
                                        }

                                        // show the preview
                                        const preview = document.getElementById(
                                            `preview-${attachment.id}`
                                        );
                                        if (preview) {
                                            preview.style.width = `${(x / width) * 100}%`;
                                        }

                                        // show the bubble
                                        const bubble = document.getElementById(
                                            `bubble-${attachment.id}`
                                        );
                                        if (bubble) {
                                            bubble.style.left = `${x}px`;

                                            bubble.innerText = new Date(time * 1000)
                                                .toISOString()
                                                .substr(14, 5);
                                        }
                                    }}
                                    onMouseDown={(e) => {
                                        setIsClicked(true);

                                        const audio = document.getElementById(
                                            `audio-${attachment.id}`
                                        ) as HTMLAudioElement;
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        const x = e.clientX - rect.left;
                                        const width = rect.width;
                                        const time = (x / width) * audio.duration;
                                        audio.currentTime =
                                            time > audio.duration
                                                ? audio.duration
                                                : time < 0
                                                ? 0
                                                : time;
                                    }}
                                    onMouseUp={() => setIsClicked(false)}
                                    onMouseLeave={() => setIsClicked(false)}
                                >
                                    <div className={styles.bar}>
                                        <div
                                            className={styles.progress}
                                            style={{
                                                width: `${
                                                    (audioCurrentTime / audioDuration) * 100
                                                }%`,
                                            }}
                                        >
                                            <span className={styles.grabber} />
                                        </div>

                                        <div
                                            className={styles.preview}
                                            id={`preview-${attachment.id}`}
                                        />

                                        <div
                                            className={styles.buffer}
                                            id={`buffer-${attachment.id}`}
                                        />

                                        <div
                                            className={styles.bubble}
                                            id={`bubble-${attachment.id}`}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className={styles.volumeContainer}>
                                <button
                                    className={styles.volume}
                                    aria-label="Control volume"
                                    onClick={() => {
                                        if (audioVolume > 0) {
                                            setAudioVolumeBeforeMute(audioVolume);
                                            setAudioVolume(0);
                                        } else {
                                            setAudioVolume(audioVolumeBeforeMute);
                                        }
                                    }}
                                    onKeyDown={(e) => {
                                        // If arrow up or arrow down, change volume accordingly
                                        if (e.key === "ArrowUp") {
                                            e.preventDefault();
                                            setAudioVolume(
                                                audioVolume + 0.1 > 1 ? 1 : audioVolume + 0.05
                                            );
                                        } else if (e.key === "ArrowDown") {
                                            e.preventDefault();
                                            setAudioVolume(
                                                audioVolume - 0.1 < 0 ? 0 : audioVolume - 0.05
                                            );
                                        }
                                    }}
                                >
                                    {audioVolume > 0.5 ? (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            height="24"
                                            width="24"
                                        >
                                            <path
                                                fill="currentColor"
                                                d="M12 3a1 1 0 0 0-1-1h-.06a1 1 0 0 0-.74.32L5.92 7H3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h2.92l4.28 4.68a1 1 0 0 0 .74.32H11a1 1 0 0 0 1-1V3ZM15.1 20.75c-.58.14-1.1-.33-1.1-.92v-.03c0-.5.37-.92.85-1.05a7 7 0 0 0 0-13.5A1.11 1.11 0 0 1 14 4.2v-.03c0-.6.52-1.06 1.1-.92a9 9 0 0 1 0 17.5Z"
                                            />
                                            <path
                                                fill="currentColor"
                                                d="M15.16 16.51c-.57.28-1.16-.2-1.16-.83v-.14c0-.43.28-.8.63-1.02a3 3 0 0 0 0-5.04c-.35-.23-.63-.6-.63-1.02v-.14c0-.63.59-1.1 1.16-.83a5 5 0 0 1 0 9.02Z"
                                            />
                                        </svg>
                                    ) : audioVolume > 0 ? (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            height="24"
                                            width="24"
                                        >
                                            <path
                                                fill="currentColor"
                                                d="M12 3a1 1 0 0 0-1-1h-.06a1 1 0 0 0-.74.32L5.92 7H3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h2.92l4.28 4.68a1 1 0 0 0 .74.32H11a1 1 0 0 0 1-1V3ZM15.18 15.36c-.55.35-1.18-.12-1.18-.78v-.27c0-.36.2-.67.45-.93a2 2 0 0 0 0-2.76c-.24-.26-.45-.57-.45-.93v-.27c0-.66.63-1.13 1.18-.78a4 4 0 0 1 0 6.72Z"
                                            />
                                        </svg>
                                    ) : (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            height="24"
                                            width="24"
                                        >
                                            <path
                                                fill="currentColor"
                                                d="M12 3a1 1 0 0 0-1-1h-.06a1 1 0 0 0-.74.32L5.92 7H3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h2.92l4.28 4.68a1 1 0 0 0 .74.32H11a1 1 0 0 0 1-1V3ZM22.7 8.3a1 1 0 0 0-1.4 0L19 10.58l-2.3-2.3a1 1 0 1 0-1.4 1.42L17.58 12l-2.3 2.3a1 1 0 0 0 1.42 1.4L19 13.42l2.3 2.3a1 1 0 0 0 1.4-1.42L20.42 12l2.3-2.3a1 1 0 0 0 0-1.4Z"
                                            />
                                        </svg>
                                    )}
                                </button>

                                <div
                                    className={styles.volumeChange}
                                    onMouseDown={(e) => {
                                        setIsVolumeClicked(true);

                                        const rect = e.currentTarget.getBoundingClientRect();
                                        const y = e.clientY - rect.top;
                                        const height = rect.height;
                                        const volume = 1 - y / height;

                                        setAudioVolume(volume > 1 ? 1 : volume < 0 ? 0 : volume);
                                    }}
                                    onMouseMove={(e) => {
                                        if (isVolumeClicked) {
                                            const rect = e.currentTarget.getBoundingClientRect();
                                            const y = e.clientY - rect.top;
                                            const height = rect.height;
                                            const volume = 1 - y / height;

                                            setAudioVolume(
                                                volume > 1 ? 1 : volume < 0 ? 0 : volume
                                            );
                                        }
                                    }}
                                    onMouseUp={() => setIsVolumeClicked(false)}
                                    onMouseLeave={() => setIsVolumeClicked(false)}
                                >
                                    <div className={styles.bar}>
                                        <div
                                            className={styles.progress}
                                            style={{
                                                height: `${audioVolume * 100}%`,
                                                top: "unset",
                                                bottom: "0",
                                                width: "100%",
                                            }}
                                        >
                                            <span className={styles.grabber} />
                                        </div>

                                        <div />
                                    </div>
                                </div>

                                <div className={styles.volumeChangeHover} />
                            </div>
                        </div>
                    </div>
                </div>
            ) : previewText ? (
                <div className={styles.text}>
                    <div className={styles.content}>
                        <pre>
                            <code
                                id={`code-${attachment.id}`}
                                ref={(el) => el && hljs.highlightElement(el)}
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
                                        // if (!textExpanded) {
                                        //     // Remove the data-highlighted attribute from the code element
                                        //     const code = document.getElementById(
                                        //         `code-${attachment.id}`
                                        //     );
                                        //     if (code) {
                                        //         code.removeAttribute("data-highlighted");
                                        //     }
                                        // }
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

                            <TooltipContent>
                                {textExpanded
                                    ? `Collapse (${expandedText.split("\n").length} lines)`
                                    : `Expand (${expandedText.split("\n").length} lines)`}
                            </TooltipContent>
                        </Tooltip>

                        <Dialog
                            open={fullTextOpen}
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

                                <TooltipContent>View whole file</TooltipContent>

                                <DialogContent blank>
                                    <div className={`${styles.textModal} scrollbar`}>
                                        <div>
                                            <pre>
                                                <code
                                                    ref={(el) => el && hljs.highlightElement(el)}
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

                            <TooltipContent>
                                Download {attachment.filename} ({getSize(attachment.size)})
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
            ) : (
                <div>
                    <header>
                        <Icon name={`file-${whichType(attachment.ext)}`} />
                        <div>
                            <a
                                target="_blank"
                                href={`${getCdnUrl()}/${attachment.id}`}
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
