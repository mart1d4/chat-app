"use client";

import useContextHook from "@/hooks/useContextHook";
import { translateCap } from "@/lib/strings";
import styles from "./Avatar.module.css";
import { useEffect } from "react";
import Image from "next/image";
import { useTooltip } from "@/lib/store";

type Props = {
    src: string;
    srcAs?: "png" | "jpeg" | "gif" | "webp";
    alt: string;
    size: 16 | 24 | 32 | 40 | 80 | 120;
    status?: EUserStatus | undefined;
    tooltip?: boolean;
    tooltipGap?: number;
    relativeSrc?: boolean;
};

const colors = {
    ONLINE: "#22A559",
    IDLE: "#F0B232",
    DO_NOT_DISTURB: "#F23F43",
    INVISIBLE: "#80848E",
    OFFLINE: "#80848E",
};

const rectSizes = {
    16: 6,
    24: 8,
    32: 10,
    40: 12,
    80: 16,
    120: 24,
};

const rectPlacements = {
    16: 5.5,
    24: 16.5,
    32: 22,
    40: 28,
    80: 60,
    120: 90,
};

const masks = {
    ONLINE: "",
    IDLE: "status-mask-idle",
    DO_NOT_DISTURB: "status-mask-dnd",
    INVISIBLE: "status-mask-offline",
    OFFLINE: "status-mask-offline",
};

export const Avatar = (props: Props) => {
    const setTooltip = useTooltip((state) => state.setTooltip);

    const rectSize = rectSizes[props.size];
    const rectPlacement = rectPlacements[props.size];

    useEffect(() => {
        return () => setTooltip(null);
    }, []);

    if (!props.src) return <></>;

    if (props.status) {
        return (
            <svg
                width={props.size + 8}
                height={props.size + 8}
                viewBox={`0 0 ${props.size + 8} ${props.size + 8}`}
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
                    width={props.size}
                    height={props.size}
                    overflow="visible"
                    mask={`url(#status-mask-${props.size})`}
                >
                    <div className={styles.container}>
                        <Image
                            src={
                                props.relativeSrc
                                    ? props.src
                                    : `${process.env.NEXT_PUBLIC_CDN_URL}${props.src}/-/resize/${props.size * 2}x/`
                            }
                            alt={props.alt}
                            width={props.size}
                            height={props.size}
                            draggable={false}
                        />
                    </div>
                </foreignObject>

                <rect
                    onMouseEnter={(e) => {
                        if (!props.tooltip) return;
                        setTooltip({
                            text: translateCap(props.status),
                            // @ts-ignore
                            element: e.currentTarget,
                            gap: props.tooltipGap || 0,
                        });
                    }}
                    onMouseLeave={() => setTooltip(null)}
                    x={rectPlacement}
                    y={rectPlacement}
                    width={rectSize}
                    height={rectSize}
                    rx={rectSize / 2}
                    ry={rectSize / 2}
                    fill={colors[props.status]}
                    mask={`url(#${masks[props.status]})`}
                />
            </svg>
        );
    }

    return (
        <div className={styles.container}>
            <Image
                src={
                    props.relativeSrc
                        ? props.src
                        : `${process.env.NEXT_PUBLIC_CDN_URL}${props.src}/-/resize/${props.size * 2}x/`
                }
                alt={props.alt}
                width={props.size}
                height={props.size}
                draggable={false}
            />
        </div>
    );
};
