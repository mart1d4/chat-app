"use client";

import type { Attachment, ResponseAttachment } from "@/type";
import { getPlaceholder } from "../../Message/Attachments";
import styles from "./ImageViewer.module.css";
import { getCdnUrl } from "@/lib/urls";
import { useState } from "react";
import Image from "next/image";
import { getImageDimensions } from "@/lib/images";

export function ImageViewer({
    attachments,
    currentIndex,
}: {
    attachments: (Attachment | ResponseAttachment)[];
    currentIndex: number;
}) {
    const [attachment, setAttachment] = useState(attachments[currentIndex]);
    const [index, setIndex] = useState(currentIndex);

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

            <div className={styles.animated}>
                <Image
                    width={width}
                    height={height}
                    draggable={false}
                    alt={attachment.filename || "Attachment"}
                    placeholder={getPlaceholder(width, height)}
                    src={"url" in attachment ? attachment.url : `${getCdnUrl()}/${attachment.id}`}
                    onError={({ currentTarget }) => {
                        currentTarget.onerror = null;
                        currentTarget.src = `/assets/system/poop.svg`;
                    }}
                />
            </div>

            <a
                target="_blank"
                href={"url" in attachment ? attachment.url : `${getCdnUrl()}/${attachment.id}`}
            >
                Open in new tab
            </a>
        </div>
    );
}
