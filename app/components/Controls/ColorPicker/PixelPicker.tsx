"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./ColorPicker.module.css";

export function PixelPicker({
    onColorPick,
    onCancel,
}: {
    onColorPick: (color: string) => void;
    onCancel: () => void;
}) {
    const [isPicking, setIsPicking] = useState(true);

    const magnifierRef = useRef<HTMLDivElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;

        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Capture the screen
        const captureScreen = async () => {
            const video = document.createElement("video");

            const stream = await navigator.mediaDevices.getDisplayMedia({
                // @ts-ignore - mediaSource is not in the types
                video: { mediaSource: "screen" },
            });

            video.srcObject = stream;
            await new Promise((resolve) => (video.onloadedmetadata = resolve));
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            video.srcObject.getTracks().forEach((track) => track.stop());
        };

        captureScreen();

        return () => {
            if (magnifierRef.current) magnifierRef.current.remove();
        };
    }, []);

    const handleMouseMove = (event: React.MouseEvent) => {
        const magnifier = magnifierRef.current;
        const canvas = canvasRef.current;

        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        if (magnifier) {
            magnifier.style.left = `${event.clientX}px`;
            magnifier.style.top = `${event.clientY}px`;

            const ctx = canvas.getContext("2d");
            const magnifiedSize = 100;
            const zoom = 3;

            const magnifierCanvas = magnifier.querySelector("canvas");

            if (!ctx || !magnifierCanvas) return;

            const magnifierCtx = magnifierCanvas.getContext("2d");

            if (!magnifierCtx) return;

            magnifierCanvas.width = magnifiedSize;
            magnifierCanvas.height = magnifiedSize;

            magnifierCtx.drawImage(
                canvas,
                x - magnifiedSize / (2 * zoom),
                y - magnifiedSize / (2 * zoom),
                magnifiedSize / zoom,
                magnifiedSize / zoom,
                0,
                0,
                magnifiedSize,
                magnifiedSize
            );
        }
    };

    const handleClick = (event: React.MouseEvent) => {
        const canvas = canvasRef.current;

        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = Math.round(event.clientX - rect.left);
        const y = Math.round(event.clientY - rect.top);

        const ctx = canvas.getContext("2d");

        if (!ctx) return;

        const pixelData = ctx.getImageData(x, y, 1, 1).data;
        const color = `rgb(${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]})`;
        setIsPicking(false);
        onColorPick(color);
    };

    return (
        isPicking && (
            <div className={styles.pixelPicker}>
                <canvas
                    ref={canvasRef}
                    className={styles.fullscreenCanvas}
                    onMouseMove={handleMouseMove}
                    onClick={handleClick}
                />
                <div
                    ref={magnifierRef}
                    className={styles.magnifier}
                >
                    <canvas />
                </div>
                <button
                    className={styles.cancelButton}
                    onClick={onCancel}
                >
                    Cancel
                </button>
            </div>
        )
    );
}
