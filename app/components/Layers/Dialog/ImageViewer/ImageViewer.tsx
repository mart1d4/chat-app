"use client";

import { Icon, Menu, MenuContent, MenuDivider, MenuItem, MenuTrigger } from "@components";
import { getPlaceholder } from "@/app/components/Message/Attachments";
import { getImageDimensions } from "@/lib/images";
import styles from "./ImageViewer.module.css";
import { getCdnUrl } from "@/lib/uploadthing";
import { useDialogContext } from "../Dialog";
import { useWindowSettings } from "@/store";
import { useEffect, useState } from "react";
import type { Attachment } from "@/type";
import Image from "next/image";

export function ImageViewer({
    attachments,
    currentIndex,
}: {
    attachments: Attachment[];
    currentIndex: number;
}) {
    const [attachment, setAttachment] = useState(attachments[currentIndex]);
    const [couldntLoad, setCouldntLoad] = useState(false);
    const [index, setIndex] = useState(currentIndex);
    const [height, setHeight] = useState(0);
    const [width, setWidth] = useState(0);

    const { setOpen } = useDialogContext();

    const url = `${getCdnUrl}${attachment.id}`;

    function copyImage() {
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

    const { widthThresholds } = useWindowSettings();
    const isWidth562 = widthThresholds[562];

    useEffect(() => {
        // Recalculate dimensions
        const getDimensions = () => {
            const { width: w, height: h } = getImageDimensions({
                w: attachment.width,
                h: attachment.height,
                maxSize: !isWidth562 ? 1 : 0.8,
            });

            setWidth(w);
            setHeight(h);
        };

        getDimensions();

        window.addEventListener("resize", getDimensions);
        return () => window.removeEventListener("resize", getDimensions);
    }, [isWidth562, attachment]);

    return (
        <div className={styles.container}>
            {attachments.length > 1 && (
                <>
                    <button
                        className={styles.previous}
                        onClick={() => {
                            const newIndex = index === 0 ? attachments.length - 1 : index - 1;
                            setAttachment(attachments[newIndex]);
                            setIndex(newIndex);
                        }}
                    >
                        <Icon name="arrow" />
                    </button>

                    <button
                        className={styles.next}
                        onClick={() => {
                            const newIndex = (index + 1) % attachments.length;
                            setAttachment(attachments[newIndex]);
                            setIndex(newIndex);
                        }}
                    >
                        <Icon name="arrow" />
                    </button>
                </>
            )}

            <button
                className={styles.close}
                onClick={() => setOpen(false)}
            >
                <Icon name="close" />
            </button>

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
                                key={url}
                                src={url}
                                width={width}
                                height={height}
                                draggable={false}
                                alt={attachment.filename || "Attachment"}
                                placeholder={getPlaceholder(width, height)}
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
                href={url}
                target="_blank"
            >
                Open in new tab
            </a>
        </div>
    );
}
