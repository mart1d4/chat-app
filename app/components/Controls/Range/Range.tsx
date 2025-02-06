"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Range.module.css";

export function Range({
    onChange,
    val,
    min,
    max,
    step,
    size,
    initValue,
    homogeneousBg,
    ...props
}: {
    onChange: (v: number) => void;
    val?: number;
    min?: number;
    max?: number;
    step?: number;
    size?: "sm" | "md" | "lg";
    initValue?: number;
    homogeneousBg?: string;
}) {
    const [isDragging, setIsDragging] = useState(false);
    const [value, setValue] = useState(initValue ?? 0);

    const slider = useRef<HTMLDivElement>(null);

    useEffect(() => {
        onChange(value);
    }, [value, onChange]);

    const handleDrag = (e: MouseEvent) => {
        if (!slider.current) return;

        const rect = slider.current.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;

        const newValue = Math.min(
            Math.max(
                Math.round(
                    ((offsetX / rect.width) * ((max ?? 100) - (min ?? 0)) + (min ?? 0)) /
                        (step ?? 1)
                ) * (step ?? 1),
                min ?? 0
            ),
            max ?? 100
        );

        if (newValue === value) return;
        setValue(newValue);
    };

    useEffect(() => {
        const handleMouseUp = () => {
            setIsDragging(false);
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;
            handleDrag(e);
        };

        document.addEventListener("mouseup", handleMouseUp);
        document.addEventListener("mousemove", handleMouseMove);

        return () => {
            document.removeEventListener("mouseup", handleMouseUp);
            document.removeEventListener("mousemove", handleMouseMove);
        };
    }, [isDragging]);

    useEffect(() => {
        setValue(val ?? 0);
    }, [val]);

    return (
        <div
            className={`${styles.slider} ${styles[size ?? "md"]}`}
            {...props}
        >
            <input
                type="range"
                min={min ?? 0}
                max={max ?? 100}
                step={step ?? 1}
                value={val ?? value}
                className={styles.input}
                focus-id="range-slider-crop"
                onChange={(e) => {
                    if (value === Number(e.target.value)) return;
                    setValue(Number(e.target.value));
                }}
            />

            <div
                ref={slider}
                className={styles.track}
                onMouseDown={(e) => {
                    setIsDragging(true);
                    handleDrag(e.nativeEvent);
                }}
                style={{
                    background:
                        homogeneousBg === "hsl"
                            ? `linear-gradient(to right, ${Array.from(
                                  { length: (max ?? 100) / (step ?? 1) },
                                  (_, i) =>
                                      `hsl(${i * (360 / ((max ?? 100) / (step ?? 1)))}, 100%, 50%)`
                              ).join(", ")})`
                            : "",
                }}
            >
                <div
                    className={styles.progress}
                    style={{
                        width: `${
                            ((Math.round((value - (min ?? 0)) / (step ?? 1)) * (step ?? 1)) /
                                ((max ?? 100) - (min ?? 0))) *
                            100
                        }%`,
                        backgroundColor: homogeneousBg ? "transparent" : undefined,
                    }}
                >
                    <div
                        id="range-slider-crop"
                        className={styles.thumb}
                    />
                </div>
            </div>
        </div>
    );
}
