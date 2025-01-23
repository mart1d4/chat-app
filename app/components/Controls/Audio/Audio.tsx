"use client";

import { useEffect, useRef, useState } from "react";
import { VolumeChanger } from "../Volume/Volume";
import styles from "./Audio.module.css";
import { Icon } from "@components";

export function AudioControls({ url }: { url: string }) {
    const [canControl, setCanControl] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isClicked, setIsClicked] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.5);

    const audio = useRef<HTMLAudioElement>(null);
    const preview = useRef<HTMLDivElement>(null);
    const buffer = useRef<HTMLDivElement>(null);
    const bubble = useRef<HTMLDivElement>(null);
    const bar = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!audio.current) return;

        audio.current.onplay = () => setIsPlaying(true);
        audio.current.onpause = () => setIsPlaying(false);

        audio.current.ontimeupdate = () => {
            if (!audio.current) return;

            setCurrentTime(audio.current.currentTime);
            setDuration(audio.current.duration);

            if (audio.current.buffered.length > 0) {
                const val = audio.current.buffered.end(0);

                if (buffer.current) {
                    buffer.current.style.width = `${(val / audio.current.duration) * 100}%`;
                }
            }
        };

        audio.current.onvolumechange = () => {
            if (!audio.current) return;
            setVolume(audio.current.volume);
            setIsMuted(audio.current.muted);
        };

        audio.current.onloadeddata = () => {
            setCanControl(true);
        };

        audio.current.onloadedmetadata = () => {
            if (!audio.current) return;
            setDuration(audio.current.duration);
        };

        audio.current.onprogress = () => {
            if (!audio.current) return;

            if (audio.current.buffered.length > 0) {
                const val = audio.current.buffered.end(0);

                if (buffer.current) {
                    buffer.current.style.width = `${(val / audio.current.duration) * 100}%`;
                }
            }
        };

        audio.current.onended = () => {
            if (!audio.current) return;
            setIsPlaying(false);
            setCurrentTime(0);
            audio.current.currentTime = 0;
        };

        return () => {
            audio.current?.pause();
        };
    }, [audio.current]);

    useEffect(() => {
        if (!audio.current || !bar.current || !canControl) return;

        const handleMouseUp = () => {
            setIsClicked(false);
            document.body.style.cursor = "unset";
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (!audio.current || !bar.current || !isHovered) return;

            const rect = bar.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const width = rect.width;
            let time = (x / width) * audio.current.duration;

            if (time > audio.current.duration) {
                time = audio.current.duration - 0.1;
            } else if (time < 0.1) {
                time = 0;
            }

            // if clicked, set the current time
            if (isClicked) {
                audio.current.currentTime = time;
            }

            // show the preview
            if (preview.current) {
                preview.current.style.width = `${(x / width) * 100}%`;
            }

            // show the bubble
            if (bubble.current) {
                // left is x but we need to make sure it doesn't go past the bar
                let left = Math.min(Math.max(x, 0), width);
                bubble.current.style.left = `${left}px`;
                bubble.current.innerText = new Date(time * 1000).toISOString().substr(14, 5);
            }
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isClicked, isHovered, canControl]);

    return (
        <div className={styles.controls}>
            <audio
                ref={audio}
                preload="metadata"
            >
                <source src={url} />
                Your browser does not support the audio element.
            </audio>

            {canControl && (
                <>
                    <button
                        type="button"
                        className={styles.play}
                        aria-label={isPlaying ? "Pause" : "Play"}
                        onClick={() => {
                            if (!audio.current) return;
                            if (isPlaying) audio.current.pause();
                            else audio.current.play();
                        }}
                    >
                        <Icon name={isPlaying ? "pause" : "play"} />
                    </button>

                    <div className={styles.duration}>
                        <span>
                            {new Date(currentTime * 1000).toISOString().substr(14, 5) || "--:--"}
                        </span>

                        <span>/</span>

                        <span>
                            {new Date(duration * 1000).toISOString().substr(14, 5) || "--:--"}
                        </span>
                    </div>

                    <div className={styles.progressContainer}>
                        <div
                            onMouseDown={(e) => {
                                if (!audio.current) return;

                                setIsClicked(true);
                                document.body.style.cursor = "grabbing";

                                const rect = e.currentTarget.getBoundingClientRect();
                                const x = e.clientX - rect.left;
                                const width = rect.width;
                                const time = (x / width) * audio.current.duration;

                                audio.current.currentTime =
                                    time > audio.current.duration
                                        ? audio.current.duration - 0.1
                                        : time < 0.1
                                        ? 0
                                        : time;
                            }}
                            onMouseEnter={(e) => {
                                setIsHovered(true);

                                if (!bar.current) return;

                                const rect = bar.current.getBoundingClientRect();
                                const x = e.clientX - rect.left;
                                const width = rect.width;

                                // show the preview
                                if (preview.current) {
                                    preview.current.style.width = `${(x / width) * 100}%`;
                                }

                                // show the bubble
                                if (bubble.current) {
                                    // left is x but we need to make sure it doesn't go past the bar
                                    let left = Math.min(Math.max(x, 0), width);
                                    bubble.current.style.left = `${left}px`;
                                }
                            }}
                            onMouseLeave={() => setIsHovered(false)}
                            style={{ cursor: isClicked ? "grabbing" : undefined }}
                        >
                            <div
                                ref={bar}
                                className={styles.bar}
                            >
                                <div
                                    className={styles.progress}
                                    style={{ width: `${(currentTime / duration) * 100}%` }}
                                >
                                    <span
                                        className={styles.grabber}
                                        style={{
                                            cursor: isClicked ? "grabbing" : undefined,
                                            transform: isClicked ? "scale(1)" : undefined,
                                        }}
                                    />
                                </div>

                                <div
                                    ref={preview}
                                    className={styles.preview}
                                />

                                <div
                                    ref={buffer}
                                    className={styles.buffer}
                                />

                                <div
                                    ref={bubble}
                                    className={styles.bubble}
                                    style={{ opacity: isClicked ? "1" : undefined }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className={styles.volume}>
                        <VolumeChanger
                            volume={volume}
                            setVolume={(vol) => {
                                if (!audio.current) return;
                                audio.current.volume = vol;
                            }}
                            isMuted={isMuted}
                            setIsMuted={(val) => {
                                if (!audio.current) return;
                                audio.current.muted = val;
                            }}
                        />
                    </div>
                </>
            )}
        </div>
    );
}
