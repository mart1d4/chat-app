"use client";

import { Tooltip, TooltipTrigger, TooltipContent } from "../Layers/Tooltip/Tooltip";
import { colors, labels, masks, rectPlacements, rectSizes } from "@/lib/avatars";
import styles from "./Avatar.module.css";
import Image from "next/image";

const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL;

if (!cdnUrl) {
    throw new Error("NEXT_PUBLIC_CDN_URL is not defined.");
}

export function Avatar({
    src,
    type,
    alt,
    size,
    status,
    tooltip,
    tooltipGap,
    relativeSrc,
}: {
    src: string;
    alt: string;
    size: 16 | 24 | 32 | 40 | 80 | 120;
    type: "avatars" | "banners" | "icons" | "system";
    status?: Users["status"];
    tooltip?: boolean;
    tooltipGap?: number;
    relativeSrc?: boolean;
}) {
    const url = relativeSrc ? src : `${cdnUrl}${src}`;
    const rectPlacement = rectPlacements[size];
    const rectSize = rectSizes[size];

    const statusObject = (
        <rect
            x={rectPlacement}
            y={rectPlacement}
            width={rectSize}
            height={rectSize}
            rx={rectSize / 2}
            ry={rectSize / 2}
            fill={colors[status]}
            mask={`url(#${masks[status]})`}
        />
    );

    if (status) {
        return (
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
                        <Image
                            src={url}
                            alt={alt}
                            width={size}
                            height={size}
                            draggable={false}
                        />
                    </div>
                </foreignObject>

                {status && tooltip && (
                    <Tooltip>
                        <TooltipTrigger>{statusObject}</TooltipTrigger>
                        <TooltipContent>{labels[status]}</TooltipContent>
                    </Tooltip>
                )}

                {status && !tooltip && statusObject}
            </svg>
        );
    }

    return (
        <div className={styles.container}>
            <Image
                src={url}
                alt={alt}
                width={size}
                height={size}
                draggable={false}
            />
        </div>
    );
}
