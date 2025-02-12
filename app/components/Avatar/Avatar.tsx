"use client";

import { colors, labels, masks, rectPlacements, rectSizes } from "@/lib/utils";
import { Tooltip, TooltipTrigger, TooltipContent } from "@components";
import { getRandomImage } from "@/lib/utils";
import { getCdnUrl } from "@/lib/uploadthing";
import styles from "./Avatar.module.css";
import type { User } from "@/type";

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
                    background: "var(--background-5)",
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
        if (!generateId) {
            console.error("generateId is required if fileId is not provided");
            return null;
        }

        url = getRandomImage(generateId, type === "user" ? "avatar" : "icon");
    }

    const rectPlacement = rectPlacements[size];
    const rectSize = rectSizes[size];

    const statusObject = status ? (
        <rect
            x={rectPlacement}
            y={rectPlacement}
            width={rectSize}
            height={rectSize}
            rx={rectSize / 2}
            ry={rectSize / 2}
            fill={colors[status as keyof typeof colors]}
            mask={`url(#${masks[status as keyof typeof masks]})`}
        />
    ) : null;

    if (type === "guild") {
        <div
            className={styles.container}
            style={{ width: size, height: size }}
        >
            {/* if no filedId, use first letters of each word of guild name, otherwise display the image*/}

            {fileId ? (
                <img
                    src={url}
                    alt={alt}
                    width={size}
                    height={size}
                    draggable={false}
                />
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
                <svg
                    width={size}
                    height={size}
                    viewBox={`0 0 ${size} ${size}`}
                    aria-hidden="true"
                    className={styles.svg}
                >
                    <mask
                        id="status-mask-24"
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
                        id="status-mask-32"
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
                        id="status-mask-40"
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
                        id="status-mask-80"
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
                        id="status-mask-120"
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

                    {/* Inner Masks */}

                    <mask
                        id="status-mask-offline"
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
                        id="status-mask-dnd"
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
                        id="status-mask-idle"
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

                    <foreignObject
                        x={0}
                        y={0}
                        width={size}
                        height={size}
                        overflow="visible"
                        mask={`url(#status-mask-${size})`}
                    >
                        <div className={styles.container}>
                            <img
                                src={url}
                                alt={alt}
                                width={size}
                                height={size}
                                draggable={false}
                            />
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
                        <img
                            src={url}
                            alt={alt}
                            width={size}
                            height={size}
                            draggable={false}
                        />
                    </div>
                </foreignObject>
            </svg>
        </div>
    );
}
