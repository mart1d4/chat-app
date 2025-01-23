"use client";

import { Menu, MenuContent, MenuDivider, MenuItem, MenuTrigger } from "@components";
import { getPlaceholder } from "@/app/components/Message/Attachments";
import { getImageDimensions } from "@/lib/images";
import type { ResponseMessage } from "@/type";
import styles from "./ImageViewer.module.css";
import { getCdnUrl } from "@/lib/uploadthing";
import { useState } from "react";
import Image from "next/image";

export function ImageViewer({
    attachments,
    currentIndex,
}: {
    attachments: ResponseMessage["attachments"][];
    currentIndex: number;
}) {
    const [attachment, setAttachment] = useState(attachments[currentIndex]);
    const [couldntLoad, setCouldntLoad] = useState(false);
    const [index, setIndex] = useState(currentIndex);

    const url = "url" in attachment ? attachment.url : `${getCdnUrl}${attachment.id}`;

    function copyImage() {
        try {
            fetch(url)
                .then((response) => response.blob())
                .then((blob) => {
                    // then get blob as data url
                    const reader = new FileReader();
                    reader.readAsDataURL(blob);
                    reader.onloadend = () => {
                        // then copy data url to clipboard
                        navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
                    };
                });
        } catch (error) {
            console.error(error);
        }
    }

    async function saveImage() {
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

    const { width, height } = getImageDimensions(attachment.width, attachment.height);

    return (
        <div className={styles.container}>
            {attachments.length > 1 && (
                <button
                    className={styles.previous}
                    onClick={() => {
                        const newIndex = index === 0 ? attachments.length - 1 : index - 1;
                        setAttachment(attachments[newIndex]);
                        setIndex(newIndex);
                    }}
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
                            d="M12.7 3.3a1 1 0 0 0-1.4 0l-5 5a1 1 0 0 0 1.4 1.4L11 6.42V20a1 1 0 1 0 2 0V6.41l3.3 3.3a1 1 0 0 0 1.4-1.42l-5-5Z"
                        />
                    </svg>
                </button>
            )}

            {attachments.length > 1 && (
                <button
                    className={styles.next}
                    onClick={() => {
                        const newIndex = (index + 1) % attachments.length;
                        setAttachment(attachments[newIndex]);
                        setIndex(newIndex);
                    }}
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
                            d="M12.7 3.3a1 1 0 0 0-1.4 0l-5 5a1 1 0 0 0 1.4 1.4L11 6.42V20a1 1 0 1 0 2 0V6.41l3.3 3.3a1 1 0 0 0 1.4-1.42l-5-5Z"
                        />
                    </svg>
                </button>
            )}

            <Menu
                positionOnClick
                openOnRightClick
                placement="right-start"
            >
                <MenuTrigger>
                    <div className={styles.animated}>
                        {couldntLoad ? (
                            <Image
                                width={200}
                                height={104}
                                draggable={false}
                                src={`/assets/system/poop.svg`}
                                alt={attachment.filename || "Attachment"}
                                placeholder={getPlaceholder(width, height)}
                            />
                        ) : (
                            <Image
                                width={width}
                                height={height}
                                draggable={false}
                                alt={attachment.filename || "Attachment"}
                                placeholder={getPlaceholder(width, height)}
                                src={
                                    "url" in attachment
                                        ? attachment.url
                                        : `${getCdnUrl}${attachment.id}`
                                }
                                onError={({ currentTarget }) => {
                                    setCouldntLoad(true);
                                    currentTarget.onerror = null;
                                    currentTarget.src = `/assets/system/poop.svg`;
                                }}
                            />
                        )}
                    </div>
                </MenuTrigger>

                <MenuContent>
                    <MenuItem onClick={() => copyImage()}>Copy Image</MenuItem>
                    <MenuItem onClick={() => saveImage()}>Save Image</MenuItem>

                    <MenuDivider />

                    <MenuItem onClick={() => copyLink()}>Copy Link</MenuItem>
                    <MenuItem onClick={() => openLink()}>Open Link</MenuItem>
                </MenuContent>
            </Menu>

            <a
                target="_blank"
                href={"url" in attachment ? attachment.url : `${getCdnUrl}${attachment.id}`}
            >
                Open in new tab
            </a>
        </div>
    );
}
