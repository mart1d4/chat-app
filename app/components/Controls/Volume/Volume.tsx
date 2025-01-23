"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Volume.module.css";
import { Icon } from "@components";

export function VolumeChanger({
    volume,
    setVolume,
    isMuted,
    setIsMuted,
}: {
    volume: number;
    setVolume: (volume: number) => void;
    isMuted: boolean;
    setIsMuted: (isMuted: boolean) => void;
}) {
    const [isVolumeClicked, setIsVolumeClicked] = useState(false);
    const bar = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleMouseUp = () => {
            if (isVolumeClicked) {
                setIsVolumeClicked(false);
                document.body.style.cursor = "unset";
            }
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (isVolumeClicked) {
                const rect = bar.current!.getBoundingClientRect();
                const y = e.clientY - rect.top;
                const height = rect.height;
                const volume = 1 - y / height;

                setVolume(volume > 1 ? 1 : volume < 0 ? 0 : volume);
            }
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isVolumeClicked, bar]);

    return (
        <div className={styles.container}>
            <button
                type="button"
                aria-label="Control volume"
                onClick={() => setIsMuted(!isMuted)}
                onKeyDown={(e) => {
                    // If arrow up or arrow down, change volume accordingly
                    if (e.key === "ArrowUp") {
                        e.preventDefault();
                        setVolume(volume + 0.1 > 1 ? 1 : volume + 0.05);
                    } else if (e.key === "ArrowDown") {
                        e.preventDefault();
                        setVolume(volume - 0.1 < 0 ? 0 : volume - 0.05);
                    }
                }}
            >
                {isMuted || volume === 0 ? (
                    <Icon name="volume-off" />
                ) : volume > 0.5 ? (
                    <Icon name="volume-up" />
                ) : (
                    <Icon name="volume-down" />
                )}
            </button>

            <div
                className={styles.changer}
                onMouseDown={(e) => {
                    setIsVolumeClicked(true);
                    document.body.style.cursor = "grabbing";

                    const rect = e.currentTarget.getBoundingClientRect();
                    const y = e.clientY - rect.top;
                    const height = rect.height;
                    const volume = 1 - y / height;

                    setVolume(volume > 1 ? 1 : volume < 0 ? 0 : volume);

                    if (volume > 0) {
                        setIsMuted(false);
                    }
                }}
                style={{
                    visibility: isVolumeClicked ? "visible" : undefined,
                    cursor: isVolumeClicked ? "grabbing" : undefined,
                }}
            >
                <div
                    ref={bar}
                    className={styles.bar}
                >
                    <div
                        className={styles.progress}
                        style={{
                            height: `${(isMuted ? 0 : volume) * 100}%`,
                            top: "unset",
                            bottom: "0",
                            width: "100%",
                        }}
                    >
                        <span
                            className={styles.grabber}
                            style={{
                                cursor: isVolumeClicked ? "grabbing" : undefined,
                                transform: isVolumeClicked ? "scale(1)" : undefined,
                            }}
                        />
                    </div>

                    <div />
                </div>
            </div>

            <div
                draggable={false}
                className={styles.preventHide}
            />
        </div>
    );
}
