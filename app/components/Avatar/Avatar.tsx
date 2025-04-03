"use client";

import { colors, labels, masks, rectPlacements, rectSizes } from "@/lib/utils";
import { Tooltip, TooltipTrigger, TooltipContent } from "@components";
import { getCdnUrl } from "@/lib/uploadthing";
import { getRandomImage } from "@/lib/utils";
import styles from "./Avatar.module.css";
import type { User } from "@/type";
import Image from "next/image";
import { useId } from "react";

export function Avatar({
    src,
    alt = "Avatar",
    size = 40,
    type,
    fileId,
    generateId,
    guildName,
    status,
    showStatusTooltip,
    speaking,
    muted,
    deafened,
}: {
    src?: string;
    alt: string;
    size?: 16 | 24 | 32 | 40 | 80 | 120;
    type?: "user" | "channel" | "guild";
    fileId?: string | null;
    generateId?: number;
    guildName?: string;
    status?: User["status"];
    showStatusTooltip?: boolean;
    speaking?: boolean;
    muted?: boolean;
    deafened?: boolean;
}) {
    if (guildName) {
        return (
            <div
                style={{
                    width: size,
                    height: size,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: size / 2,
                    color: "white",
                    background: "var(--bg-5)",
                    borderRadius: "50%",
                }}
            >
                {guildName
                    .split(" ")
                    .map((word) => word[0])
                    .join("")}
            </div>
        );
    }

    // src is for static images
    // fileId is for dynamic images such as avatars or channel icons
    // if fileId is not provided, we will use the provided generateId to get a default avatar or icon
    let url = src;

    if (fileId) {
        url = `${getCdnUrl}${fileId}`;
    } else {
        url = getRandomImage(generateId, type === "user" ? "avatar" : "icon");
    }

    const rectPlacement = rectPlacements[size];
    const rectSize = rectSizes[size];
    const masksId = useId();

    const statusObject = status ? (
        <rect
            x={rectPlacement}
            y={rectPlacement}
            width={rectSize}
            height={rectSize}
            rx={rectSize / 2}
            ry={rectSize / 2}
            className={styles.status}
            fill={colors[status as keyof typeof colors]}
            mask={`url(#${masks[status as keyof typeof masks]}-${masksId})`}
        />
    ) : null;

    if (type === "guild") {
        <div
            className={styles.container}
            style={{ width: size, height: size }}
        >
            {/* if no filedId, use first letters of each word of guild name, otherwise display the image*/}

            {fileId ? (
                !url ? null : (
                    <Image
                        src={url}
                        alt={alt}
                        width={size}
                        height={size}
                        draggable={false}
                    />
                )
            ) : (
                <svg
                    width={size}
                    height={size}
                    viewBox={`0 0 ${size} ${size}`}
                    aria-hidden="true"
                    className={styles.svg}
                >
                    <foreignObject
                        x={0}
                        y={0}
                        width={size}
                        height={size}
                        overflow="visible"
                    >
                        <div className={styles.container}>
                            <div className={styles.guildName}>
                                {guildName
                                    ?.split(" ")
                                    .map((word) => word[0])
                                    .join("")}
                            </div>
                        </div>
                    </foreignObject>
                </svg>
            )}
        </div>;
    }

    if (status) {
        return (
            <div
                className={styles.container}
                style={{ width: size, height: size }}
            >
                {speaking && <div className={styles.speaking} />}

                <svg
                    width={size}
                    height={size}
                    aria-hidden="true"
                    className={styles.svg}
                    viewBox={`0 0 ${size} ${size}`}
                >
                    <Masks id={masksId} />

                    <foreignObject
                        x={0}
                        y={0}
                        width={size}
                        height={size}
                        overflow="visible"
                        mask={`url(#status-mask-${size}-${masksId})`}
                    >
                        <div className={styles.container}>
                            {url && (
                                <Image
                                    src={url}
                                    alt={alt}
                                    width={size}
                                    height={size}
                                    draggable={false}
                                />
                            )}
                        </div>
                    </foreignObject>

                    {status && showStatusTooltip && (
                        <Tooltip>
                            <TooltipTrigger>{statusObject}</TooltipTrigger>
                            <TooltipContent>{labels[status as keyof typeof labels]}</TooltipContent>
                        </Tooltip>
                    )}

                    {status && !showStatusTooltip && statusObject}
                </svg>
            </div>
        );
    }

    return (
        <div
            className={styles.container}
            style={{ width: size, height: size }}
        >
            {speaking && <div className={styles.speaking} />}

            <svg
                width={size}
                height={size}
                aria-hidden="true"
                className={styles.svg}
                viewBox={`0 0 ${size} ${size}`}
            >
                {(muted || deafened) && (
                    <mask
                        id={`status-mask-voice-${size}-${masksId}`}
                        maskContentUnits="objectBoundingBox"
                        viewBox="0 0 1 1"
                    >
                        <circle
                            fill="white"
                            cx="0.5"
                            cy="0.5"
                            r="0.5"
                        />
                        <circle
                            fill="black"
                            cx="0.85"
                            cy="0.85"
                            r="0.2"
                        />
                    </mask>
                )}

                <foreignObject
                    x={0}
                    y={0}
                    width={size}
                    height={size}
                    overflow="visible"
                    mask={
                        muted || deafened ? `url(#status-mask-voice-${size}-${masksId})` : undefined
                    }
                >
                    <div className={styles.container}>
                        {url && (
                            <Image
                                src={url}
                                alt={alt}
                                width={size}
                                height={size}
                                draggable={false}
                            />
                        )}
                    </div>
                </foreignObject>
            </svg>

            {(muted || deafened) && (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={styles.voiceStatus}
                    viewBox="0 0 24 24"
                    fill="none"
                    height="24"
                    width="24"
                >
                    {deafened ? (
                        <path d="M22.7 2.7a1 1 0 0 0-1.4-1.4l-20 20a1 1 0 1 0 1.4 1.4l20-20ZM17.06 2.94a.48.48 0 0 0-.11-.77A11 11 0 0 0 2.18 16.94c.14.3.53.35.76.12l3.2-3.2c.25-.25.15-.68-.2-.76a5 5 0 0 0-1.02-.1H3.05a9 9 0 0 1 12.66-9.2c.2.09.44.05.59-.1l.76-.76ZM20.2 8.28a.52.52 0 0 1 .1-.58l.76-.76a.48.48 0 0 1 .77.11 11 11 0 0 1-4.5 14.57c-1.27.71-2.73.23-3.55-.74a3.1 3.1 0 0 1-.17-3.78l1.38-1.97a5 5 0 0 1 4.1-2.13h1.86a9.1 9.1 0 0 0-.75-4.72ZM10.1 17.9c.25-.25.65-.18.74.14a3.1 3.1 0 0 1-.62 2.84 2.85 2.85 0 0 1-3.55.74.16.16 0 0 1-.04-.25l3.48-3.48Z" />
                    ) : (
                        <path d="m2.7 22.7 20-20a1 1 0 0 0-1.4-1.4l-20 20a1 1 0 1 0 1.4 1.4ZM10.8 17.32c-.21.21-.1.58.2.62V20H9a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2h-2v-2.06A8 8 0 0 0 20 10a1 1 0 0 0-2 0c0 1.45-.52 2.79-1.38 3.83l-.02.02A5.99 5.99 0 0 1 12.32 16a.52.52 0 0 0-.34.15l-1.18 1.18ZM15.36 4.52c.15-.15.19-.38.08-.56A4 4 0 0 0 8 6v4c0 .3.03.58.1.86.07.34.49.43.74.18l6.52-6.52ZM5.06 13.98c.16.28.53.31.75.09l.75-.75c.16-.16.19-.4.08-.61A5.97 5.97 0 0 1 6 10a1 1 0 0 0-2 0c0 1.45.39 2.81 1.06 3.98Z" />
                    )}
                </svg>
            )}
        </div>
    );
}

export function Masks({ id }: { id: string }) {
    return (
        <>
            <mask
                id={`status-mask-24-${id}`}
                maskContentUnits="objectBoundingBox"
                viewBox="0 0 1 1"
            >
                <circle
                    fill="white"
                    cx="0.5"
                    cy="0.5"
                    r="0.5"
                />

                <circle
                    fill="black"
                    cx="0.85"
                    cy="0.85"
                    r="0.275"
                />
            </mask>

            <mask
                id={`status-mask-32-${id}`}
                maskContentUnits="objectBoundingBox"
                viewBox="0 0 1 1"
            >
                <circle
                    fill="white"
                    cx="0.5"
                    cy="0.5"
                    r="0.5"
                />

                <circle
                    fill="black"
                    cx="0.85"
                    cy="0.85"
                    r="0.25"
                />
            </mask>

            <mask
                id={`status-mask-40-${id}`}
                maskContentUnits="objectBoundingBox"
                viewBox="0 0 1 1"
            >
                <circle
                    fill="white"
                    cx="0.5"
                    cy="0.5"
                    r="0.5"
                />

                <circle
                    fill="black"
                    cx="0.85"
                    cy="0.85"
                    r="0.240"
                />
            </mask>

            <mask
                id={`status-mask-80-${id}`}
                maskContentUnits="objectBoundingBox"
                viewBox="0 0 1 1"
            >
                <circle
                    fill="white"
                    cx="0.5"
                    cy="0.5"
                    r="0.5"
                />

                <circle
                    fill="black"
                    cx="0.85"
                    cy="0.85"
                    r="0.175"
                />
            </mask>

            <mask
                id={`status-mask-120-${id}`}
                maskContentUnits="objectBoundingBox"
                viewBox="0 0 1 1"
            >
                <circle
                    fill="white"
                    cx="0.5"
                    cy="0.5"
                    r="0.5"
                />

                <circle
                    fill="black"
                    cx="0.85"
                    cy="0.85"
                    r="0.16"
                />
            </mask>

            <mask
                id={`status-mask-offline-${id}`}
                maskContentUnits="objectBoundingBox"
                viewBox="0 0 1 1"
            >
                <circle
                    fill="white"
                    cx="0.5"
                    cy="0.5"
                    r="0.5"
                />

                <circle
                    fill="black"
                    cx="0.5"
                    cy="0.5"
                    r="0.25"
                />
            </mask>

            <mask
                id={`status-mask-dnd-${id}`}
                maskContentUnits="objectBoundingBox"
                viewBox="0 0 1 1"
            >
                <circle
                    fill="white"
                    cx="0.5"
                    cy="0.5"
                    r="0.5"
                />

                <rect
                    fill="black"
                    x="0.125"
                    y="0.375"
                    width="0.75"
                    height="0.25"
                    rx="0.125"
                    ry="0.125"
                />
            </mask>

            <mask
                id={`status-mask-idle-${id}`}
                maskContentUnits="objectBoundingBox"
                viewBox="0 0 1 1"
            >
                <circle
                    fill="white"
                    cx="0.5"
                    cy="0.5"
                    r="0.5"
                />

                <circle
                    fill="black"
                    cx="0.25"
                    cy="0.25"
                    r="0.375"
                />
            </mask>
        </>
    );
}
