"use client";

import { Icon, VolumeChanger } from "@components";
import { useWavesurfer } from "@wavesurfer/react";
import styles from "./VoiceMessage.module.css";
import { useRef } from "react";

export function VoiceMessage({ url, blob }: { url?: string; blob?: Blob }) {
    const containerRef = useRef(null);

    const { wavesurfer, isPlaying, currentTime } = useWavesurfer({
        container: containerRef,
        waveColor: "hsl(228, 6%, 33%)",
        progressColor: "#ffffff",
        url: url ?? URL.createObjectURL(blob as Blob),
        height: 32,
        barGap: 6,
        barRadius: 1000,
        dragToSeek: true,
        barWidth: 3,
        cursorColor: "transparent",
    });

    const onPlayPause = () => {
        wavesurfer && wavesurfer.playPause();
    };

    const setVolume = (v: number) => {
        wavesurfer && wavesurfer.setVolume(v);
    };

    const setIsMuted = (m: boolean) => {
        wavesurfer && wavesurfer.setMuted(m);
    };

    const duration = wavesurfer?.getDuration() ?? 0;

    return (
        <div className={styles.preview}>
            <button
                type="button"
                onClick={onPlayPause}
                className={styles.play}
            >
                <Icon
                    size={18}
                    name={isPlaying ? "pause" : "play"}
                />
            </button>

            <div
                ref={containerRef}
                className={styles.waveform}
            />

            <span className={styles.time}>
                {(duration - currentTime)
                    .toFixed(0)
                    .padStart(3, "0")
                    .replace(/(\d{2})$/, ":$1")}
            </span>

            <div>
                <VolumeChanger
                    volume={wavesurfer?.getVolume() ?? 1}
                    setVolume={setVolume}
                    isMuted={wavesurfer?.getMuted() ?? false}
                    setIsMuted={setIsMuted}
                />
            </div>
        </div>
    );
}
