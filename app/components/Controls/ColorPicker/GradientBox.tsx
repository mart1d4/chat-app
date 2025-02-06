"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./ColorPicker.module.css";
import convert from "color-convert";

export function GradientBox({
    color,
    onColorSelect,
}: {
    color: [number, number, number];
    onColorSelect: ([r, g, b]: [number, number, number]) => void;
}) {
    const [isPicking, setIsPicking] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const cursorRef = useRef<HTMLDivElement>(null);
    const boxRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;

        const [hue] = convert.rgb.hsl(color);

        // Create gradient: left-to-right white to color, top-to-bottom transparent to black
        const colorGradient = ctx.createLinearGradient(0, 0, width, 0);
        colorGradient.addColorStop(0, "white");
        colorGradient.addColorStop(1, `hsl(${hue}, 100%, 50%)`);

        const blackGradient = ctx.createLinearGradient(0, 0, 0, height);
        blackGradient.addColorStop(0, "rgba(0, 0, 0, 0)");
        blackGradient.addColorStop(1, "black");

        // Fill gradients
        ctx.fillStyle = colorGradient;
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = blackGradient;
        ctx.fillRect(0, 0, width, height);
    }, [color]);

    const pickColor = useCallback(
        (event: React.MouseEvent) => {
            const canvas = canvasRef.current;
            if (!canvas) return;

            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            const { data } = ctx.getImageData(x, y, 1, 1);
            const [r, g, b] = data;

            onColorSelect([r, g, b]);
        },
        [onColorSelect]
    );

    useEffect(() => {
        if (!color || !canvasRef.current || !cursorRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;

        // Extract RGB values from the input color
        const [r, g, b] = color;

        // Get canvas pixel data and find the closest matching pixel
        const imageData = ctx.getImageData(0, 0, width, height);
        const { data } = imageData;

        let closestMatch = null;
        let closestDistance = Infinity;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const index = (y * width + x) * 4; // Get the RGBA values
                const [pr, pg, pb] = [data[index], data[index + 1], data[index + 2]];

                // Calculate the Euclidean distance between colors
                const distance = Math.sqrt(
                    Math.pow(r - pr, 2) + Math.pow(g - pg, 2) + Math.pow(b - pb, 2)
                );

                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestMatch = { x, y };
                }
            }
        }

        // Position the cursor based on the closest match
        if (closestMatch) {
            const cursor = cursorRef.current;
            cursor.style.left = `${(closestMatch.x / width) * 100}%`;
            cursor.style.top = `${(closestMatch.y / height) * 100}%`;
        }
    }, [color]);

    return (
        <div
            ref={boxRef}
            className={styles.gradientBox}
            onMouseUp={() => setIsPicking(false)}
            onMouseLeave={() => setIsPicking(false)}
            onMouseDown={(e) => {
                setIsPicking(true);
                pickColor(e);
            }}
            onMouseMove={(e) => {
                if (isPicking) pickColor(e);
            }}
        >
            <canvas
                width={220}
                height={150}
                ref={canvasRef}
            />

            <div
                ref={cursorRef}
                className={styles.cursor}
            />
        </div>
    );
}
